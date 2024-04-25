import { addQueryArgs } from '@wordpress/url';
import { buildCheckoutUrl } from 'calypso/blocks/importer/util';

export function getMigrationAssistanceCheckoutUrl(
	siteSlug: string,
	flowName: string,
	stepName: string,
	queryParams: URLSearchParams
) {
	queryParams.delete( 'showModal' );
	const checkoutUrl = buildCheckoutUrl( siteSlug );
	const returnUrl = `/setup/${ flowName }/${ stepName }?${ queryParams.toString() }`;
	const preparedCheckoutUrl = addQueryArgs( checkoutUrl, {
		redirect_to: returnUrl,
		cancel_to: returnUrl,
	} );
	return preparedCheckoutUrl;
}
