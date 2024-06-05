import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useTranslate } from 'i18n-calypso';

type Props = {
	setServices: ( tokens: ( string | TokenItem )[] ) => void;
	selectedServices: ( string | TokenItem )[];
};

const ServicesSelector = ( { setServices, selectedServices }: Props ) => {
	const translate = useTranslate();

	const availableServices: Record< string, string > = {
		agricultural_services: translate( 'Agricultural services' ),
		contracted_services: translate( 'Contracted services' ),
		transportation_services: translate( 'Transportation services' ),
		utility_services: translate( 'Utility services' ),
		retail_outlet_services: translate( 'Retail outlet services' ),
		clothing_shops: translate( 'Clothing shops' ),
		miscellaneous_shops: translate( 'Miscellaneous shops' ),
		business_services: translate( 'Business services' ),
		professional_services_and_membership_organisations: translate(
			'Professional services and membership organisations'
		),
		government_services: translate( 'Government services' ),
	};

	const setTokens = ( tokens: ( string | TokenItem )[] ) => {
		const selectedServicesByToken = tokens.filter( ( token ) => {
			return Object.keys( availableServices ).find(
				( key: string ) => availableServices?.[ key ] === token
			);
		} );

		setServices( selectedServicesByToken );
	};

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			onChange={ setTokens }
			suggestions={ Object.values( availableServices ) }
			value={ selectedServices }
		/>
	);
};

export default ServicesSelector;
