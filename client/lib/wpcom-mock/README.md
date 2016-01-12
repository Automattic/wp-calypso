wpcom-mock
======

`wpcom-mock` is a helper module for your tests which can be used to mock calls to WPCOM API.
Every requests made through the module `lib/wp` can be mocked.
It does this by creating a stub on `wpcom.request` which is the generic method
which actually makes the requests to the WPCOM HTTP API
(using xhr when identified with OAuth or an iframe otherwise).


You should not attempt to create more than one instance of WpcomMock at the same time.
This is because WpcomMock rewrites wpcom.request and thus will throw an error if you try more than once:
```
TypeError: Attempted to wrap request which is already wrapped
```
In your tests, it is recommended to create the mock instance in a before() or a beforeEach() hook.


## How to use

```javascript
var WpcomMock = require( 'lib/wpcom-mock' ),
    wpcomMock = WpcomMock(),
    fetchOptions = {
        number: 100,
        offset: 0,
        order: 'ASC',
        order_by: 'display_name',
        search: null,
        search_columns: [ 'display_name', 'user_login' ],
        siteId: siteId
    };
wpcomMock.mock().site( siteId ).usersList( fetchOptions, function( mockResponse ) {
    mockResponse( null, usersData );
} );
```

## Other methods to mock a WPCOM API request:

- Mocking the request directly
```javascript
wpcomMock.mockRequest( {
    params: {
        apiVersion: '1.1',
        method: 'GET',
        path: `/sites/${siteId}/users`,
        query: WpcomMock.utils.queryString( fetchOptions )
    },
    response: usersData
} );
```

- Loading a recording
```javascript
wpcomMock.mockWith( 'mock-requests' );
```

with `mock-requests.json` being a file which has the following structure:

```javascript
{
  "GET /sites/75913855/users?number=100&offset=0&order=ASC&order_by=display_name&search=&search_columns%5B%5D=display_name&search_columns%5B%5D=user_login&siteId=75913855": {
    "response": {
      "found": 7,
      "users": [...],
      "_headers": {
        "Date": "Tue, 15 Sep 2015 14:15:42 GMT",
        "Content-Type": "application/json"
      }
    }
  },
  "POST /sites/75913855/menus/new": [
    {
      "params": {
        "path": "/sites/75913855/menus/new",
        "method": "POST",
        "body": {
          "name": "Menu 1",
          "items": [...],
          "id": 5319
        }
      },
      "response": {
        "id": 5319,
        "_headers": {
          "Date": "Tue, 15 Sep 2015 14:16:53 GMT",
          "Content-Type": "application/json"
        }
      }
    }
  ]
}
```

This data can be copied from a recording.
See `client/devtools/README.md` for more information on how to record your requests.
