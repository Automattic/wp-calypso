search
======

Reusable search component with controls for opening and closing the search input field.

## Props

### onSearch
Callback to fire to obtain search results. By default this gets called `onChange`, which happens on each keypress. If `delaySearch` is also set, this function will only fire after the user has stopped typing for at least 400 milliseconds, which is useful to avoid unnecessary asynchronous fetches. Passes in a string matching the value of the field or `false` when the search field is closed.

### onSearchChange (optional)
This is only necessary if `delaySearch` is being used to delay a fetch callback, but you want to respond immediately to the updated value (e.g., show that the user is currently searching). Passes in a string matching the value of the field or `false` when the search field is closed.

### analyticsGroup
We track usage of the search component, so we need to know where search is being used. E.g., "Posts" for the search instance in the Posts page.

### initialValue (optional)
Use this to set the initial value of the field (_not the placeholder, which is different from the value_). Most cases should not require this. However this is necessary to populate the search box for example if a user is loading a bookmarked search results page with a url like:

`/posts?s=keyword`

### delaySearch (optional) boolean ( default false )
Use this prop to delay the `onSearch` callback until after the user has stopped typing. If `delaySearch` is false there is no delay between keyup and the `onSearch` callback. If the filtering is done asynchronously (i.e., via ajax request) `delaySearch` should be true to avoid a request on each keypress. The default delay is 300ms but can be customized using `delayTimeout`.

### delayTimeout (optional) number ( default 300 )
If `delaySearch` is true, this prop can be used to control the number of milliseconds used to determine when the user has stopped typing. It's a good idea to leave this at its default value unless there's a specific reason to change the timeout (e.g., a very expensive search may benefit from a longer timeout).

### pinned (optional) bool ( default false )
Whether to display the search input from collapsed by default. If not set, the search input will show as already expanded.

### fitsContainer (optional) bool ( default false )
Position search absolutely, taking the height of the containing element and anchor to the right side.

### placeholder (optional)
The label to place inside the search field if/when empty. Defaults to a translated version of "Search…".

### autoFocus (optional) bool ( default false )
This value is passed to the autoFocus attribute of the `<input>` element, and determines whether or not the input is automatically focused.

### disabled (optional) bool ( default false )
This value is passed to the disabled attribute of the `<input>` element, and determines whether or not the input is disabled.

### searching (optional) bool ( default false )
Whether to display a [`<Spinner />`](../spinner/) in place of the search icon.

### dir (optional) string ( default undefined )
Whether to force a specific writing direction for the search field, regardless of the current global writing direction. Useful for inputting domains, codes, etc that use LTR direction when in a RTL language.

Currently supports forcing a LTR field in a RTL language, but not the other way around.

Supported values are `'ltr'` and `undefined` (the default, which uses the current global writing direction of the app).

## Methods

### getCurrentSearchValue()
Returns the current value of the search input element. While you will generally pass in a callback function which will be called whenever the search value is changed by the user, it can also be useful to query for the current search value directly.
