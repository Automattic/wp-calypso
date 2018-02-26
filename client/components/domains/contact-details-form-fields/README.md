Domain Contact Details Form
=============

This component renders a contact form with fields specific to purchasing a domain or editing a domain's WHOIS contact details.

Its primary purpose for existing is to ensure consistency between the domain checkout form (`/checkout/some-domain.blog`) and the edit WHOIS contact form (`/domains/manage/some-domain.blog/edit-contact-info/some-domain.blog`).


## Usage


```jsx
    <ContactDetailsFormFields
        eventFormName="Edit Contact Info"
        contactDetails={ contactDetailsObject }
        disableSubmitButton={ false }
        getIsFieldDisabled={ customFieldDisabledCheck }
        labelTexts={ labelTextOverridesObjects }
        needsFax={ false }
        onCancel={ handleCancelButtonClick }
        onContactDetailsChange={ handleContactDetailsChange }
        onSubmit={ handleSubmitButtonClick }
        onValidate={ validateFormValues }
        onSanitize={ sanitizeFormValues }
    />

```

## Props

### contactDetails {Object} (required)

The form model, consisting of key/value pairs. Keys must be **camelCase**.

```js
{
    firstName: 'Osso',
    lastName: 'Buco',
    organization: 'Il pagliaccio del comune',
    email: 'osso@buco.com',
    phone: '+3398067382',
    address1: 'Via Strada Bella',
    address2: '',
    city: 'Piccolo Villagio',
    state: 'AG',
    postalCode: '12345',
    countryCode: 'IT',
    fax: '+3398067382',
},

```

### eventFormName {String} (optional)

Passed to child field components for tracking purposes.

**Default value**: `'Domain contact details form'`


### disableSubmitButton {Bool} (optional)

Disables the submit button, and therefore prevents form submission

**Default value**: `false`

### getIsFieldDisabled {Func} (optional)

Executed at render time providing the parent component with an opportunity to disable individual/all the form fields.

#### Arguments

{String} name of form field to be disabled

Usage:

```js
    // the method to be passed as a prop to <ContactDetailsFormFields />
    // disables the firstName field when firstNameEditable === false
	customFieldDisabledCheck = ( name ) => {
		if ( name === 'firstName' && firstNameEditable === false ) {
			return true;
		}
	};
```

### labelTexts {Object} (optional)

An object of strings that override certain label texts. This is mainly used for conditional labels and translated texts.

Currently supports only two values: `submitButton` and `organization`.

Example:

```js
{
    submitButton: this.hasAnotherStep()
        ? translate( 'Continue' )
        : translate( 'Continue to Checkout' ),
    organization: translate(
        'Registering this domain for a company? + Add Organization Name',
        'Registering these domains for a company? + Add Organization Name',
        {
            count: this.getNumberOfDomainRegistrations(),
        }
    ),
}
```

### needsFax {Bool} (optional)

Renders the fax field when set to `true`

**Default value**: `false`

### onCancel {Func} (optional)

Callback for cancel button. By default the cancel button will not show if no method is passed.

### onContactDetailsChange {Func} (optional)

Triggered whenever a form value changes. 

#### Arguments

1. {Object} The full form object model containing the new values

Usage:

```js
    // the method to be passed as a prop to <ContactDetailsFormFields />
	onContactDetailsChange = ( newContactDetails ) => {
		this.props.updateReduxStore( newContactDetails );
	};
```

### onSubmit {Func} (required)

Triggered onSubmit and when all fields are valid

#### Arguments

1. {Object} The full form object model containing the new values

Usage:

```js
    // the method to be passed as a prop to <ContactDetailsFormFields />
	onSubmit = ( newContactDetails ) => {
		wp.updateSomething( newContactDetails );
	};
```

### onValidate {Func} (optional)

Runs a custom validation check after a field update

#### Arguments

1. {Object} The full form object model containing the new values
2. {Function} A callback to be triggered when validation is complete. See `form-state` ([this._validatorFunction](https://github.com/Automattic/wp-calypso/blob/master/client/lib/form-state/index.js)) for details.

Usage:

```js
    // the method to be passed as a prop to <ContactDetailsFormFields />
	validate = ( fieldValues, onComplete ) => {
	    checkValidity( fieldValues, ( error, data ) => {
            const messages = ( data && data.messages ) || {};
            onComplete( error, messages );
        });
	};
```

### onSanitize {Func} (optional)

Runs a custom sanitize method after a field update

#### Arguments

1. {Object} The full form object model containing the new values
2. {Function} A callback to be triggered when sanitization is complete. See `form-state` ([this._sanitizerFunction](https://github.com/Automattic/wp-calypso/blob/master/client/lib/form-state/index.js)) for details.

Usage:

```js
    // the method to be passed as a prop to <ContactDetailsFormFields />
	onSanitize = ( fieldValues, onComplete ) => {
        const newValues = {
            lastName: fieldValues.lastName === 'SHOUTYMAN' ? 'Shoutyman' : fieldValues.lastName,
        };
	    onComplete( Object.assign( {}, fieldValues, newValues ) );
	};
```

