Dirty Linked State
============
This mixin works like [React Linked State Mixin](https://facebook.github.io/react/docs/two-way-binding-helpers.html), 
but also updates a dirtyFields array on the state object. This array lets us know if any fields have been
modified by the user. This is useful when we don't want to wipe out user changes on polling updates. 
See `client/my-sites/site-settings/form-base.js` for an example of this in action.

Usage
-----

Enable this per component by adding it to its `mixins`:

```
import dirtyLinkedState from ("lib/mixins/dirty-linked-state");
app.TodoItem = React.createClass( {
    mixins: [ dirtyLinkedState ],
    render() {
      return ( 
        <input type="text" valueLink={ this.linkState( 'blogname' ) } />
        <input type="text" valueLink={ this.linkState( 'blogdescription' ) } /> 
      );
    }
```

Example
-----
Before the user types in the field the state object might look like:

```
{ 
	blogname: 'default title',
	blogdescription: 'default description'
}
```

After typing:

```
{
	blogname: 'new title',
	blogdescription: 'default description',
	dirtyFields[ 'blogname' ]
}
```
