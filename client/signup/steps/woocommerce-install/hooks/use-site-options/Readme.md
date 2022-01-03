# useSiteOtions

Simple React custom hook to handle site options.

## API
The hook requires a key used to define the option of the site settings object,
returning an object with four classic helpers to deal with the data handling.

```es6
const { get, save, update, clean } = useSiteOptions( <option-id> );
```
### get(<key>)

Simple getter helper.

### update(<key>, <value>)

Helper to 'update' site options in the redux store.
### save(<key>, <value>)

Helper to 'save' site options permanently on the server-side.
### clean()

Clean the site option value from the store.

## Example

```es6
import useSiteOptions from './use-site-options';

```es6
function StoreAddressFrom() {
	const { get, save, update, clean } = useSiteOptions( 'personal-data' );

	return (
		<div>
			<TextControl
				label={ __( 'First name' ) }
				value={ get( 'firstName' ) }
				onChange={ ( value ) => update( { firstName: value } ) }
			/>

			<TextControl
				label={ __( 'Last name' ) }
				value={ get( 'lastName' ) }
				onChange={ ( value ) => update( { lastName: value } ) }
			/>

			<Button onClick={ clean }>Clean</Button>

			<Button onClick={ save }>Save</Button>
		</div>
	);
}
```
