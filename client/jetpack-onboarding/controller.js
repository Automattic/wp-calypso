/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal Dependencies
 */
import JetpackOnboardingMain from './main';
import { renderWithReduxStore } from 'lib/react-helpers';
import { setSection } from 'state/ui/actions';

const removeSidebar = context => {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );
};

export const onboarding = context => {
	removeSidebar( context );

	renderWithReduxStore(
		<JetpackOnboardingMain stepName={ context.params.stepName } />,
		'primary',
		context.store
	);
};
