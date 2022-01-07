# useSiteSettings

Simple React custom hook to handle site options.

## API

The hook must be called passing the site ID, returning an object with different properties and helpers

### Example

```es6
import useSiteSettings from './use-site-settings';

function StoreAddressFrom() {
	const { get, save, update } = useSiteSettings( 'site-id' );

	return (
		<div>
			<TextControl
				label={ __( 'Store address' ) }
				value={ get( 'woocommerce_store_address' ) }
				onChange={ ( newAddress ) => update( { woocommerce_store_address: newAddress } ) }
			/>

			<Button onClick={ save }>Save</Button>
		</div>
	);
}
```

### countriesList

A countries list with payment context.
### get(<key>)

Simple getter helper.

### update(<key>, <value>)

Helper to 'update' site options in the redux store.
### save(<key>, <value>)

Helper to 'save' site options permanently on the server-side.

### multipleOptionHandler

Use this helper when the option contains multiple values. It returns get and update methods for this particular option.

## Example

```es6
import useSiteSettings from './use-site-settings';

function StoreAddressFrom() {
	const { multipleOptionHandler, save } = useSiteSettings( 'site-id' );
	const { get, update } = multipleOptionHandler( 'woocommerce_onboarding_profile' );

	return (
		<div>
			<TextControl
				label={ __( 'Email address', 'woocommerce-admin' ) }
				value={ get( 'store_email' ) }
				onChange={ ( value ) => update( 'store_email', value ) }
			/>

			<CheckboxControl
				label={ __( 'Agreed marketing', 'woocommerce-admin' ) }
				checked={ get( 'is_agree_marketing' ) }
				onChange={ ( value ) => update( 'is_agree_marketing', value ) }
			/>

			<Button onClick={ save }>Save</Button>
		</div>
	);
}
```
