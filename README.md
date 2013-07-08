## Rodeo
#### Realtime notifications with Redis and Node.js

[![Build Status](https://secure.travis-ci.org/thisandagain/rodeo.png)](http://travis-ci.org/thisandagain/rodeo)

### Installation
```bash
npm install rodeo
```

### Usage
```javascript
var rodeo   = require('rodeo');

rodeo.on('message', function (notice) {
    // Do something else!
});

rodeo.listen({}, function (err) {
    // Listening for messages... now let's submit a new message
    rodeo.submit({
        target:     'user::1234',
        persist:    true,
        message:    'Hello world!'
    }, function (err) {
        // It worked!
    });
});
```

### Notice Model
Notices follow a very simple convention allowing for arbitrary extension through the "message" object:
```json
{
    "id": "beb62c35-252e-44ec-9083-fd44a1e51a9f",
    "stamp": "2012-08-13T15:06:40.097Z",
    "read": false,
    "persist": false,
    "target": "test::1234",
    "message": "Hello World"
}
```

```json
{
    "id": "beb62c35-252e-44ec-9083-fd44a1e51a9f",
    "stamp": "2012-08-13T15:06:40.097Z",
    "read": true,
    "persist": false,
    "target": "test::1234",
    "message": {
        "foo": "bar",
        "nyan": "cat",
        "country": {
            "music": "rules"
        }
    }
}
```

### CLI
Rodeo includes a command line interface which makes testing a bit simpler:
```bash
[sudo] npm install -g rodeo
```

```bash
cat message.json | rodeo --target 'test::1234' --persist
```

To use the CLI with non-default redis connection settings. Simply set the `RODEO_CLI_HOST`, `RODEO_CLI_PORT`, and (optionally) `RODEO_CLI_PASS` environment variables.

### Testing
```bash
npm test
```