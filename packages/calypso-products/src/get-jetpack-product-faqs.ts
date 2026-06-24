import { getJetpackProductsFAQs } from './translations';
import type { JSX } from 'react';
/**
 * Get Jetpack product "FAQs" info based on the product slug.
 */
export function getJetpackProductFAQs(
	product_slug: string,
	getHelpLink: ( context: unknown ) => JSX.Element,
	getSupportLink: ( context: unknown ) => JSX.Element
) {
	const jetpackProductsFAQsInfo = getJetpackProductsFAQs( getHelpLink, getSupportLink );
	return jetpackProductsFAQsInfo[ product_slug ];
}
