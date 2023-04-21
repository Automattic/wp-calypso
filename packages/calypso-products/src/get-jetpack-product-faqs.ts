import { getJetpackProductsFAQs } from './translations';
/**
 * Get Jetpack product "FAQs" info based on the product purchase object.
 */
export function getJetpackProductFAQs(
	product_slug: string,
	getHelpLink: ( context: unknown ) => JSX.Element
) {
	const jetpackProductsFAQsInfo = getJetpackProductsFAQs( getHelpLink );
	return jetpackProductsFAQsInfo[ product_slug ];
}
