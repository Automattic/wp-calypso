/** @format */
/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import onboardingModule from 'my-sites/looka/onboarding';
import exploreModule from 'my-sites/looka/explore';
import editorModule from 'my-sites/looka/editor';

export function onboarding( context, next ) {
	context.primary = React.createElement( onboardingModule, {
		context: context,
	} );

	next();
}

export function explore( context, next ) {
	context.primary = React.createElement( exploreModule, {
		context: context,
	} );

	next();
}

export function editor( context, next ) {
	context.primary = React.createElement( editorModule, {
		context: context,
	} );

	next();
}
