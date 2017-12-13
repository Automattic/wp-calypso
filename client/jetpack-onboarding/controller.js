/** @format */
/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import JetpackOnboardingMain from './main';
import { setSection } from 'state/ui/actions';

const removeSidebar = context => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );
};

export const onboarding = ( context, next ) => {
	removeSidebar( context );

	context.primary = <JetpackOnboardingMain stepName={ context.params.stepName } />;
	next();
};
