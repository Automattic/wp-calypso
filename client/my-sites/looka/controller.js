/** @format */
/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import onboardingModule from 'my-sites/looka/onboarding';

export function onboarding( context, next ) {
	context.primary = React.createElement( onboardingModule, {
		context: context,
	} );

	next();
}
