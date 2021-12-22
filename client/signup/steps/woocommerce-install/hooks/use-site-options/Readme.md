# useSiteOtions

Custom React hook to handle site options.

## API

### Getting site option

```es6
import useSiteOptions from './use-site-options';

```es6
function StoreAddressFrom() {
	const { data, get, save, update, clean } = useSiteOptions( 'store-address' );
	const storeData = { firstName: '', lastName: '' };

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
