addQueryArgs
==========
This module is meant to simplify the work of adding query arguments to a URL.

### Parameters
- `args` (object)(Required) – The first parameter is an object of query arguments to be added to the URL.
- `url` (string)(Required) – The second parameter is the original URL to add `args` to.


### Example
```
import addQueryArgs from 'lib/add-query-args';

addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );             // https://wordpress.com?foo=bar
addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' ); // https://wordpress.com/?search=test&foo=bar 
```
