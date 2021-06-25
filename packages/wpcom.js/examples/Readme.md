# Examples

## Server application

It's an express application that gets the blog posts making a server-side request.

```bash
$ make example-server
```

Finally open a browser and load the page pointing to <http://localhost:3000>.

Keep in mind that this app gets the config data from test/data.json file.

There are two pages to test:

- index.html
- file_upload.html

## CORS (Browser)

```bash
$ make example-browser-cors
```

Make requests using CORS.

## Node.js

Simple node.js script to get freshly pressed list.

Into `examples/node` run:

```bash
$ node freshlyPressed.js
```
