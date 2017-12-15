/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { findKey } from 'lodash';

/**
 * Internal Dependencies
 */
import JetpackOnboardingMain from './main';
import { setJetpackOnboardingSiteId } from 'state/ui/actions';
import { setSection } from 'state/ui/actions';
import { urlToSlug } from 'lib/url';

const removeSidebar = context => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );
};

export const onboarding = ( context, next ) => {
	removeSidebar( context );

	context.primary = <JetpackOnboardingMain stepName={ context.params.stepName } />;
	next();
};

export const siteSelection = ( context, next ) => {
	const state = context.store.getState();

	// TODO: move to a separate selector
	const siteId = findKey( state.jetpackOnboarding.credentials, credentials => {
		const siteSlug = urlToSlug( credentials.siteUrl );
		return siteSlug === context.params.site;
	} );

	if ( siteId ) {
		context.store.dispatch( setJetpackOnboardingSiteId( parseInt( siteId, 10 ) ) );
	}

	next();
};
