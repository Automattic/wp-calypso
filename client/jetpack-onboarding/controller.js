/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import JetpackOnboardingMain from './main';
import { hideSidebar } from 'state/ui/actions';

export const onboarding = ( context, next ) => {
	context.store.dispatch( hideSidebar() );

	// We validate siteSlug inside the component
	context.primary = (
		<JetpackOnboardingMain
			action={ context.query.action }
			siteSlug={ context.params.site }
			stepName={ context.params.stepName }
		/>
	);
	next();
};
