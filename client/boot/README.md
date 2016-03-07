Boot
======

This module is where all the client-side magic starts. The core set of application modules that contain the client-side application routes, any additional application bootstrapping occurs, and the page.js router is started triggering the initial route handler.

Boot is responsible for handling a lot of features we want to happen on every page. The major ones are (in roughly chronological order):

- Initializing i18n
- Injecting the i18n mixin to React components
- Adding touch events
- Adding accessibility focus features
- Setting the document title
- Passing layout to all page handlers
- Passing the query and hash objects into the page.js context
- Boot strapping translation strings
- Setting up analytics
- Rendering the main layout template
- Focussing parts of the layout based on the query string
- Handling query strings
- Loading various helpers (olark, keyboard shortcuts, network connection)
- Starting page.js

## Client-side Routing

We use the [page](https://www.npmjs.com/package/page) npm library for client-side routing. Routes are added by calling the `page` function, first parameter
being the `path` and the second one the `callback` (handler) mapped to that path. Routes are added in a linear or
non-linear order, depending on whether [Webpack]'s Code Splitting is enabled or not. See [server/bundler/README.md](/server/bundler/README.md) for more 
info about code splitting. Code splitting is enabled by default.

### Routes with Code Splitting disabled

When code splitting is __disabled__, Webpack transforms [client/sections.js](/client/sections.js) into synchronous `require`s of Calypso
sections. It means that if we call `sections.load()`, all the sections are imported and their routes are ordered one after another
so that if a request is made and one of the routes is matched, its handler (callback) is called, possibly rendering
some React component. If no route is matched, there is a catch-all route (`page( '*' )`) at the end of the routes chain,
added just before calling `page.start()`. This route serves as 404 handler.

### Routes with Code Splitting enabled

When code splitting is __enabled__, Webpack transforms [client/sections.js](/client/sections.js) into asynchronous `require.ensure` of 
Calypso sections. When `sections.load()` is called, only the split points are defined and no section is imported yet.
Before `page.start()` is called, the order of routes looks like this:

1. Router initialization (as described in the first part of this doc);
2. Routes to sections defining split points for Webpack, such as:

    ```js
    page( /^\/customize(\/.*)?$/, function( context, next ) {
        require.ensure( 'customize', function( require, error ) {
            require( 'my-sites/customize' )();
        } );
    } );
    
    page( /^\/me(\/.*)?$/, function( context, next ) {
        require.ensure( 'me', function( require, error ) {
            require( 'me' )();
        } );
    } );
    
    page( /^\/media(\/.*)?$/, function( context, next ) {
        require.ensure( 'media', function( require, error ) {
            require( 'my-sites/media' )();
        } );
    } );
    
    // etc...
    ```

3. Catch-all route for 404 handling.

If we make a request to a non-existent section (e.g.: `/foo`), no section split point route is matched, therefore
no section is imported and so the 404 handler is matched, showing 404. On the other hand, if we make a request
to an existent section (e.g.: `/me`), it is asynchronously loaded through `require.ensure`. However, the main 404
handler is still called because after importing the particular section, we call `next()`. To prevent it from showing
404, we set a property on router's `context` in a particular section's split point,
which indicates that a section split point route was matched.

But a new problem arises here: what if we make a request to an existent section, but non-existent path in that section
(e.g.: `/me/foo`)? The main 404 handler __will not__ be called because it was registered before the routes of that section
were, as they are imported asynchronously, only when hitting a valid code splitting point. The solution is to add
a new 404 handler for __each__ section, specific only to the particular section. For example:

```js
page( /^\/customize(\/.*)?$/, function( context, next ) {
    require.ensure( 'customize', function( require, error ) {
        require( 'customize' )();
        
        path( /^\/customize(\/.*)?$/, show404 );
    } );
} );

page( /^\/me(\/.*)?$/, function( context, next ) {
    require.ensure( 'me', function( require, error ) {
        require( 'me' )();
        
        path( /^\/me(\/.*)?$/, show404 );
    } );
} );

// etc...
```

So, how does the final order of routes look like when making a request to `/me/foo`?

1. Router initialization (as described in the first part of this doc);
2. Routes to sections defining split points for Webpack (described above);
3. Catch-all route for 404 handling (the main 404 handler);
4. Routes from `me` section;
5. 404 handler for `me` section.

The catch-all route for 404 handling in the 3. point is not matched, because, as mentioned earlier, we set a flag
in each section split point that it was matched, so that this 404 handler is skipped. This way, we give the 
section specific 404 handler a chance to run.

For more information see [server/bundler/README.md](/server/bundler/README.md) and/or [server/bundler/loader.js](/server/bundler/loader.js).

   
    
        
