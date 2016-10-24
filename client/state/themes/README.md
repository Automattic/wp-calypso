Theme Data
==========

Contains reducers, selectors, and action creators for themes, and the theme showcase.

### current-theme/

Manages data concerning each site's currently selected theme.

### theme-details/

Provides details for a theme given its ID.

### themes-last-query/

Tracks the last themes query.

### themes-list/

Manages the list of themes, per query.

### themes/

Contains a global list of themes queried so far.

### themes-ui/

Any UI-associated state, rather than data.

## Action Creators

### actions

Redux actions. Note that async actions require the
[redux-thunk][thunk] middleware. Examples can be found inside.

[bind]: http://rackt.org/redux/docs/api/bindActionCreators.html
[thunk]: https://github.com/gaearon/redux-thunk
