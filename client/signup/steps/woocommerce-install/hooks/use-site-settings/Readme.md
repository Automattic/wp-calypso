# useSiteSettings

Simple React custom hook to handle site options.

```es6
const { get, save, update } = useSiteSettings( <site-id> );
```
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
				label={ __( 'First name' ) }
				value={ get( 'first_name' ) }
				onChange={ ( value ) => update( { first_name: value } ) }
			/>

			<TextControl
				label={ __( 'Last name' ) }
				value={ get( 'last_name' ) }
				onChange={ ( value ) => update( { last_name: value } ) }
			/>

			<Button onClick={ save }>Save</Button>
		</div>
	);
}
```
