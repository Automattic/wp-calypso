# wpcom-proxy-request

**Proxied cookie-authenticated REST API requests to WordPress.com**

This module offers access to the WordPress.com REST API via a proxying `<iframe>`
pointing to a special URL that proxies API requests on the host page's behalf.

It is intended to be used in the browser (client-side) via a bundler like
browserify.


### Installation

Install `wpcom-proxy-request` using `npm`:

``` bash
$ npm install wpcom-proxy-request
```

### Example

``` html
<html>
  <body>
    <script src="wpcom-proxy-request.js"></script>
    <script>
      wpcomProxyRequest('/me', function(err, res){
        if (err) throw err;

        var div = document.createElement('div');
        div.innerHTML = 'Your WordPress.com "username" is: <b>@' + res.username + '<\/b>';
        document.body.appendChild(div);
      });
    </script>
  </body>
</html>
```

### License

MIT – Copyright Automattic 2014
