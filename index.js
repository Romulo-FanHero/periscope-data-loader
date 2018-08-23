// dependencies
const csv = require('csvtojson');
const promise = require('bluebird');
const sleep = require('sleep-promise');
const request = require('requestretry');
const htmlParser = require('htmlparser2');

// csv url to json array of rows
const parseCsvUrl = params => new Promise((resolve, reject) => {
    let rows = [];
    new csv()
        .fromStream(request(params))
        .subscribe(
            json => rows.push(json),
            err => reject(err),
            () => resolve(rows)
        );
});

// periscope data shared dashboard parser
const parseDashboard = params => new Promise((resolve, reject) => {
    let parser = new htmlParser.Parser({
        onopentag: async (name, attrs) => {
            if (name !== 'body') return;

            if (!attrs || !attrs.hasOwnProperty('data-state'))
                reject(new Error('periscope data could not be found on the provided url'));

            let dataState = JSON.parse(attrs['data-state']);
            if (!dataState || !dataState.hasOwnProperty('Widget') || !Array.isArray(dataState.Widget) || !dataState.Widget.length)
                reject(new Error('no valid periscope indicators could be found'));

            let widgets = [];
            params.labels.forEach(l => {
                dataState.Widget.forEach(w => {
                    if (w.hasOwnProperty('title') && w.title.toString().trim().toLowerCase() === l.trim().toLowerCase())
                        widgets.push(w);
                })
            });

            resolve(await promise.map(widgets, async widget => {
                let url = `https://app.periscopedata.com/shared_dashboards/${params.dashId}/download_csv/${widget.formula_source_hash_key}`;

                let tries = params.maxAttempts;
                while (tries--) {
                    try {
                        let data = await parseCsvUrl(Object.assign(params, { url: url, fullResponse: false }));
                        if (data && data.length)
                            return {
                                label: widget.title,
                                data: data
                            };
                    }
                    catch(e) {}
                    await sleep(params.retryDelay);
                };
            }, { concurrency: 1 }));
        }
    }, { decodeEntities: true });
    parser.parseComplete(params.body);
});

// main
module.exports = promise.method(async params => {
    let url = params && params.url ? params.url.toString() : 'https://app.periscopedata.com/shared/6867a77f-b484-4b49-864f-92c8f9cbde9a';
    let labels = params && Array.isArray(params.labels) ? params.labels : ['welcome'];
    let reqParams = {
        followAllRedirects: true,
        timeout: params && Number.isInteger(params.timeout) ? params.timeout : 2500,
        retryDelay: params && Number.isInteger(params.retryDelay) ? params.retryDelay : 2500,
        maxAttempts: params && Number.isInteger(params.maxAttempts) ? params.maxAttemps : 15,
        concurrency: params && Number.isInteger(params.concurrency) ? params.concurrency : 1
    }
    let res = await request(Object.assign(reqParams, { url: url, fullResponse: true }));
    return await parseDashboard(Object.assign(reqParams, {
        labels: labels,
        body: res.body,
        dashId: res.request.uri.pathname.substr(8, 36)
    }));
});
