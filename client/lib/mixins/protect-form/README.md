Protect-Form
============

This mixin protects a user from navigating away from a form that has been edited without having been saved. When your form has been marked as changed, the browser will open a confirm dialog if you try to navigate away from the page without saving the changes.

Special Note: This module returns an object with a `mixin` attribute. So if you want to use this in a React component, you would do so like this:

```
var protectForm = require( 'lib/mixins/protect-form' );
```

... and then later in your component definition like so:

```
    mixins: [ protectForm.mixin ],
```

You can use the protect-form mixin by adding a call to `this.markChanged()` to the `onChange` even in your form like this:

```
<form onChange={ this.markChanged } onSubmit={ this.handleSubmit }>
```

And then very important, you also need to to call `this.markSaved()` when your form has been successfully submitted. Here is an example onSubmit callback handler.

```
    submitForm: function( event ) {

        event.preventDefault();
        this.props.site.saveSettings( this.state, function( error, data ) {
            if ( error ) {
                // handle error case here
            } else {
                this.markSaved();
            }
        }.bind( this ) );
    },
```


