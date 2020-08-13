/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { slugToSelectorProduct, durationToString } from './utils';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Type dependencies
 */
import type { UpsellPageProps } from './types';

const UpsellPage = ( { duration, productSlug, rootUrl }: UpsellPageProps ) => {
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	// TODO: Get upsells via API.

	// If the product is not valid, send the user to the selector page.
	const product = slugToSelectorProduct( productSlug );
	if ( ! product ) {
		// The duration is optional, but if we have it keep it.
		let durationSuffix = '';
		if ( duration ) {
			durationSuffix = '/' + durationToString( duration );
		}
		page.redirect( rootUrl.replace( ':site', siteSlug ) + durationSuffix );
		return null;
	}

	return (
		<div>
			<h1>Hello this is the Upsell Page!</h1>
		</div>
	);
};

export default UpsellPage;
