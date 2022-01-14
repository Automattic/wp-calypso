# useSiteSettings

Simple React custom hook to handle site options.

## API

```es6
const { get, save, update } = useSiteSettings( <site-id> );
```

### countriesList

A countries list with payment context.
### get(<key>)

Simple getter helper.

### update(<key>, <value>)

Helper to 'update' site options in the redux store.
### save(<key>, <value>)

Helper to 'save' site options permanently on the server-side.

## Example

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
