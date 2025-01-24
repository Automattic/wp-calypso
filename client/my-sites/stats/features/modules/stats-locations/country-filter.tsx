import { SelectControl } from '@wordpress/components';

const CountryFilter: React.FC< {
	countries: { label: string; countryCode: string; value: number; region: string }[];
	defaultLabel: string;
	selectedCountry: string | null;
	onCountryChange: ( value: string ) => void;
} > = ( { countries, defaultLabel, selectedCountry, onCountryChange } ) => {
	const onChange = ( value: string ) => {
		onCountryChange( value );
	};

	const options = [
		{ label: defaultLabel, value: '' },
		...countries.map( ( country ) => ( {
			label: country.label,
			value: country.countryCode,
		} ) ),
	];

	return (
		<SelectControl onChange={ onChange } options={ options } value={ selectedCountry ?? '' } />
	);
};

export default CountryFilter;
