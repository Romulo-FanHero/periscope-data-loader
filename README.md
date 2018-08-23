# periscope-data-loader
_periscope-data-loader_ downloads query results from charts within a shared Periscope Data dashboard

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

## License

[MIT](LICENSE.md)
