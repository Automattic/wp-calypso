import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useTranslate } from 'i18n-calypso';

type Props = {
	setServices: ( services: ( string | TokenItem )[] ) => void;
	selectedServices: ( string | TokenItem )[];
};

const ServicesSelector = ( { setServices, selectedServices }: Props ) => {
	const translate = useTranslate();

	const availableServices: Record< string, string > = {
		seo_advertising: translate( 'SEO & Advertising' ),
		email_social_media_marketing: translate( 'Email & social media marketing' ),
		content_marketing: translate( 'Content marketing' ),
		conversion_checkout_optimization: translate( 'Conversion & checkout optimization' ),
		site_optimization: translate( 'Site optimization' ),
		plugin_site_updates: translate( 'Plugin site updates' ),
		store_build_migration: translate( 'Store build & migration' ),
		consulting: translate( 'Consulting' ),
		ecommerce_consulting: translate( 'eCommerce consulting' ),
		growth_consultation: translate( 'Growth consultation' ),
		accessibility_audit: translate( 'Accessibility audit' ),
		security_audit: translate( 'Security audit' ),
		cross_border_multilingual_consultation: translate( 'Cross Border / Multilingual Consultation' ),
	};

	// It converts the values selected into their keys
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
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ setTokens }
			suggestions={ Object.values( availableServices ) }
			value={ selectedServices }
		/>
	);
};

export default ServicesSelector;
