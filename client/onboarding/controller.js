/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import OnboardingMain from './main';
import { addQueryArgs } from 'lib/route';
import { externalRedirect } from 'lib/route/path';
import { setUrlScheme } from 'lib/url';
import { renderWithReduxStore } from 'lib/react-helpers';
import { setOnboardingToken, setOnboardingUrl } from 'state/onboarding/actions';

export default {
	init( context ) {
		let url = context.query.url;

		if ( ! url ) {
			return page.redirect( '/' );
		}

		context.store.dispatch( setOnboardingUrl( url ) );

		url = url.replace( '::', '/' );
		url = setUrlScheme( url, 'http' );
		url = addQueryArgs(
			{
				page: 'jetpack',
				action: 'get-onboarding-token',
			},
			url + '/wp-admin/admin.php'
		);

		externalRedirect( url );
	},

	saveToken( context ) {
		const token = context.query.token;
		const url = context.query.url;

		if ( ! token || ! url ) {
			return page.redirect( '/' );
		}

		context.store.dispatch( setOnboardingUrl( url ) );
		context.store.dispatch( setOnboardingToken( token ) );

		page.redirect( '/onboarding/start' );
	},

	start( context ) {
		renderWithReduxStore( React.createElement( OnboardingMain ), 'primary', context.store );
	},
};
