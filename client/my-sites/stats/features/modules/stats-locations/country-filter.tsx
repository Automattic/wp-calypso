import { SelectControl } from '@wordpress/components';

const CountryFilter: React.FC< {
	countries: { label: string; countryCode: string; value: number; region: string }[];
	defaultLabel: string;
	selectedCountry: string | null;
	onCountryChange: ( value: string ) => void;
	tooltip?: React.ReactNode;
} > = ( { countries, defaultLabel, selectedCountry, onCountryChange, tooltip } ) => {
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
		<div className="stats-module-locations__country-filter">
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				onChange={ onChange }
				options={ options }
				value={ selectedCountry ?? '' }
			/>
			<div className="stats-module-locations__country-filter--tooltip"> { tooltip } </div>
		</div>
	);
};

export default CountryFilter;
