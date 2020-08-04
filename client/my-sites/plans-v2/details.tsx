/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { DetailsPageProps } from './types';
import { TERM_ANNUALLY } from 'lib/plans/constants';

const DetailsPage = ( { duration, productType }: DetailsPageProps ) => {
	const durationString = duration === TERM_ANNUALLY ? 'annual' : 'monthly';
	return (
		<div>
			<h1>Hello this is the Details Page!</h1>
			<p>{ `You are currently choosing between types of ${ productType } with a ${ durationString } duration.` }</p>
		</div>
	);
};

export default DetailsPage;
