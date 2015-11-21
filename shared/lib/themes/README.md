Theme Data
==========

Contains stores and action creators for themes, and the theme showcase.

## Stores

We're transitioning to a more `redux`-like architecture, so our Flux `./stores` are created from `./reducers`, using our own `createReducerStore()`.

### current-theme

Manages data concerning each site's currently selected theme.

### theme-last-event

Tracks last searched terms and activated theme, for analytics purposes.

### themes-last-query

Tracks the last themes query.

### themes-list

Manages the list of themes, per query.

### themes

Contains a global list of themes queried so far.

## Action Creators

### actions

Redux actions. Note that async actions require the
[redux-thunk][thunk] middleware. Examples can be found inside.

### flux-actions

Flux wrapper around the Redux actions. Uses Redux's
[`bindActionCreators`][bind] along with our own `combineStores()`
for wrapping. Also applies the [thunk] and [analytics] middlewares.

## Middlewares

### middlewares

Custom middlewares to be applied to the store creating function. Currently only
one analytics related middleware.

[bind]: http://rackt.org/redux/docs/api/bindActionCreators.html
[thunk]: https://github.com/gaearon/redux-thunk
[analytics]: https://github.com/markdalgleish/redux-analytics
