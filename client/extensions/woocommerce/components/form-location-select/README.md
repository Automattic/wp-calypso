# Form Location select

## FormCountrySelectFromApi

Display a list of the supported countries for a given WooCommerce site.

### Props

#### `onChange`

Required. Callback fired when the select changes.

#### `value`

Required. The currently-selected country, as ISO3166 alpha-2 country code (e.g. AU, US, etc)

#### `siteId`

The source site for the countries list request. Defaults to the currently-selected site.

## FormStateSelectFromApi

Display a list of the supported states in a country for a given WooCommerce site. If the country does not have states, the component renders a disabled dropdown, with 'N/A'.

### Props

#### `onChange`

Required. Callback fired when the select changes.

#### `country`

Required. The already-selected country, as ISO3166 alpha-2 country code (e.g. AU, US, etc). This is used to fetch the correct set of states.

#### `value`

Required. The currently-selected state, as state code (e.g. NY, CT, QC, etc).

#### `siteId`

The source site for the countries list request. Defaults to the currently-selected site.

### How to use

```jsx
import FormFieldSet from 'calypso/components/forms/form-fieldset';
import FormCountrySelectFromApi from 'woocommerce/components/form-location-select/countries';
import FormStateSelectFromApi from 'woocommerce/components/form-location-select/states';

function render() {
	return (
		<FormFieldSet className="address-view__country">
			<FormCountrySelectFromApi value={ country } onChange={ onChange } />
			<FormStateSelectFromApi country={ country } value={ state } onChange={ onChange } />
		</FormFieldSet>
	);
}
```
