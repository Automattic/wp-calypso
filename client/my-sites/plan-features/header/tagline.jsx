/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_PERSONAL
} from 'lib/plans/constants';

export function PlanFeaturesHeaderTagline( { planType, translate } ) {
	let tagline;

	switch ( planType ) {
		case PLAN_FREE:
			tagline = translate( 'Not sure? Start here' );
			break;
		case PLAN_PERSONAL:
			tagline = translate( 'Best for Bloggers' );
			break;
		case PLAN_PREMIUM:
			tagline = translate( 'Best for Enterpreneurs & Freelancers' );
			break;
		case PLAN_BUSINESS:
			tagline = translate( 'Best for Business Owners' );
			break;
		default:
			tagline = '';
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return tagline ? <p className="plan-features__header-tagline">{ tagline }</p> : null;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default localize( PlanFeaturesHeaderTagline );
