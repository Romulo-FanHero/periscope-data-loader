# periscope-data-loader
_periscope-data-loader_ extracts query results from charts within a shared Periscope Data dashboard

## Installation

### node.js

    npm install periscope-data-loader

## Usage async / await

```javascript
const periscopeData = require('periscope-data-loader');

(async () => {
    let result = await periscopeData({
        url: 'https://app.periscopedata.com/shared/6867a77f-b484-4b49-864f-92c8f9cbde9a',
        labels: ['welcome'],
    });
    console.log(JSON.stringify(result, null, 4));
})();
```

## Required params

* `url` - shared dashboard URL generated statically through the Periscope Data [GUI](https://doc.periscopedata.com/article/share-dashboards) or dynamically via [Embed API](https://doc.periscopedata.com/article/embed-api-options)
* `labels` - an array containing the titles (labels) for all indicators within the shared dashboard that should be loaded. They must be unique throughout the dashboard otherwise only the first might be loaded correctly

## Optional params

* `timeout` - maximum time (in ms) allowed for each HTTP request (the minimum number of requests is equal to the number of desired `labels` plus one)
* `retryDelay` - time (in ms) between multiple HTTP calls/retries to periscope data
* `maxAttempts` - maximum number of HTTP retries allowed for each indicator that needs to be loaded
* `concurrency` - maximum number of indicators to be loaded simultaneously

P.s. be nice to the Periscope Data servers by avoiding excessive `concurrency` and small values for `retryDelay` or the calls for data could be aggressively throttled

## Internals

* HTML parsing goes through [htmlparser2](https://github.com/fb55/htmlparser2)
* HTTP retry functionality is provided by [request-retry](https://github.com/FGRibreau/node-request-retry)
* concurrency is made possible by calling [bluebird's](https://github.com/petkaantonov/bluebird) `Promise.map`
* query results are decoded from streamed CSV to JSON via [CSVtoJSON](https://github.com/Keyang/node-csvtojson)

## License

[MIT](LICENSE.md)
