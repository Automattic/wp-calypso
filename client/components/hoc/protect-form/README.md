Protect-Form
============

This [Higher Order Component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) protects a user from navigating away from a form that has been edited without having been saved. When your form has been marked as changed, the browser will open a confirm dialog if you try to navigate away from the page without saving the changes.

Usage
-----

```
import { protectForm } from 'components/hoc/protect-form';
```

... and then later in your component definition like so:

```
    export default protectForm( MyComponent );
```

The protect-form HoC provide a `markChanged` prop you can on the `onChange` even of your form like this:

```
<form onChange={ this.props.markChanged } onSubmit={ this.handleSubmit }>
```

And then very important, you also need to to call the second prop `markSaved` when your form has been successfully submitted. Here is an example onSubmit callback handler.

```
    submitForm( event ) {
        event.preventDefault();
        this.saveSettings( this.state ).then(() => {
            this.props.markSaved();
        });
    },
```
