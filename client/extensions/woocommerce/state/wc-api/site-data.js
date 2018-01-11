/** @format */

/**
 * External dependencies
 */
import { get, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import productDescriptors from './products';

export default function createSiteData( wcApiSite, state ) {
	if ( ! isNumber( wcApiSite ) ) {
		return null;
	}

	const siteData = get( state, 'extensions.woocommerce.wcApi', {} )[ wcApiSite ];

	return {
		products: productDescriptors( siteData ),
	};
}
