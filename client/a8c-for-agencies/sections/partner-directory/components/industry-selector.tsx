import { SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	setIndustry: ( industry: string ) => void;
	industry: string;
};

const IndustrySelector = ( { setIndustry, industry }: Props ) => {
	const translate = useTranslate();

	const industries = [
		{
			label: translate( 'Select your industry' ),
			value: '',
		},
		{
			label: translate( 'Agricultural services' ),
			value: 'agricultural_services',
		},
		{
			label: translate( 'Business services' ),
			value: 'business_services',
		},
		{
			label: translate( 'Clothing shops' ),
			value: 'clothing_shops',
		},
		{
			label: translate( 'Contracted services' ),
			value: 'contracted_services',
		},
		{
			label: translate( 'Government services' ),
			value: 'government_services',
		},
		{
			label: translate( 'Miscellaneous shops' ),
			value: 'miscellaneous_shops',
		},
		{
			label: translate( 'Professional services and membership organisations' ),
			value: 'professional_services_and_membership_organisations',
		},
		{
			label: translate( 'Retail outlet services' ),
			value: 'retail_outlet_services',
		},
		{
			label: translate( 'Transportation services' ),
			value: 'transportation_services',
		},
		{
			label: translate( 'Utility services' ),
			value: 'utility_services',
		},
	];

	return (
		<SelectControl
			value={ industry }
			options={ industries }
			onChange={ setIndustry }
		></SelectControl>
	);
};

export default IndustrySelector;
