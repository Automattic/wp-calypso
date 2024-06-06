import { SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	setIndustry: () => void;
	industry: string;
};

const IndustrySelector = ( { setIndustry }: Props ) => {
	const translate = useTranslate();

	const industries = [
		{
			disabled: true,
			label: translate( 'Agricultural services' ),
			value: 'agricultural_services',
		},
		{
			disabled: true,
			label: translate( 'Contracted services' ),
			value: 'contracted_services',
		},
		{
			disabled: true,
			label: translate( 'Transportation services' ),
			value: 'transportation_services',
		},
		{
			disabled: true,
			label: translate( 'Utility services' ),
			value: 'utility_services',
		},
		{
			disabled: true,
			label: translate( 'Retail outlet services' ),
			value: 'retail_outlet_services',
		},
		{
			disabled: true,
			label: translate( 'Clothing shops' ),
			value: 'clothing_shops',
		},
		{
			disabled: true,
			label: translate( 'Miscellaneous shops' ),
			value: 'miscellaneous_shops',
		},
		{
			disabled: true,
			label: translate( 'Business services' ),
			value: 'business_services',
		},
		{
			disabled: true,
			label: translate( 'Professional services and membership organisations' ),
			value: 'professional_services_and_membership_organisations',
		},
		{
			disabled: true,
			label: translate( 'Government services' ),
			value: 'government_services',
		},
	];

	return <SelectControl options={ industries } onChange={ setIndustry }></SelectControl>;
};

export default IndustrySelector;
