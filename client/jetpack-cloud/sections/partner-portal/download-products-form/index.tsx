import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';

export default function DownloadProductsForm() {
	const translate = useTranslate();

	const attachedSiteId = getQueryArg( window.location.href, 'attachedSiteId' ) as number;
	const licenseKeys = getQueryArg( window.location.href, 'products' ) as string;

	const wooKeys = licenseKeys.split( ',' ).find( ( key ) => key.startsWith( 'woocommerce-' ) );
	const jetpackKeys = licenseKeys
		.split( ',' )
		.find( ( key ) => ! key.startsWith( 'woocommerce-' ) );

	console.log( 'attachedSiteId', parseInt( attachedSiteId ) );
	console.log( 'wooKeys', wooKeys );
	console.log( 'jetpackKeys', jetpackKeys );

	return <div>{ translate( 'Download products' ) }</div>;
}
