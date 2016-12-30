Protect-Form
============

This [Higher Order Component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) protects a user from navigating away from a form that has been edited without having been saved. When your form has been marked as changed, the browser will open a confirm dialog if you try to navigate away from the page without saving the changes.

Usage
-----

```es6
import { protectForm } from 'lib/protect-form';
```

... and then later in your component definition like so:

```es6
export default protectForm( MyComponent );
```

The protect-form HoC provides a `markChanged` prop you can call on the `onChange` event of your form like this:

```jsx
<form onChange={ this.props.markChanged } onSubmit={ this.handleSubmit }>
```

And then very important, you also need to to call the second prop `markSaved` when your form has been successfully submitted. Here is an example onSubmit callback handler.

```es6
    submitForm( event ) {
        event.preventDefault();
        this.saveSettings( this.state ).then( () => {
            this.props.markSaved();
        } );
    },
```
