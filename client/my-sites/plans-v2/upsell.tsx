/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { UpsellPageProps } from './types';
import { TERM_ANNUALLY } from 'lib/plans/constants';

const UpsellPage = ( { duration, productSlug }: UpsellPageProps ) => {
	const durationString = duration === TERM_ANNUALLY ? 'annual' : 'monthly';
	return (
		<div>
			<h1>Hello this is the Upsell Page!</h1>
			<p>{ `You are currently being offered to add another product onto ${ productSlug } with a ${ durationString } duration.` }</p>
		</div>
	);
};

export default UpsellPage;
