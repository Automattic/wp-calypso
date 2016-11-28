# Debugging the Server

So you need to step through the server side code to figure 
out what's going on under the hood?

You just need this magic snippet:

``` bash
make install
NODE_ENV=development CALYPSO_ENV=development NODE_PATH=server:client:. node --inspect --dbg-break build/bundle-development.js
```

It will output a url to use with Google Chrome. Once you navigate to that url,
you will be able to step through the code running on the server.
