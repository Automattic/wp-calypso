# **core/viewport**: The viewport module Data

## Selectors 

### isViewportMatch

Returns true if the viewport matches the given query, or false otherwise.

*Parameters*

 * state: Viewport state object.
 * query: Query string. Includes operator and breakpoint name,
                      space separated. Operator defaults to >=.

## Actions

### setIsMatching

Returns an action object used in signalling that viewport queries have been
updated. Values are specified as an object of breakpoint query keys where
value represents whether query matches.

*Parameters*

 * values: Breakpoint query matches.