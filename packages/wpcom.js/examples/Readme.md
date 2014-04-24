# Examples

## Server application

It's an express application that gets the blog posts making a server-side request.

```bash
$ make example-server
```

Finally open a browser and load the page pointing to http://localhost:3000.

Keep in mind that this app gets the config data from test/data.json file.

## Browser application (using wpcom-proxy-request)

it's also an express app but the requests are done from the browser using
[wpcom-proxy-request](https://github.com/Automattic/wpcom-proxy-request).

```bash
$ make example-browser-proxy
```

## Node.js

Simple node.js script to get freshly pressed list.

Into `examples/node` run:

```bash
$ node freshlyPressed.js
```
