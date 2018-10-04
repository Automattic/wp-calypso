/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Settings from '../components/settings';
import SetupWizard from '../components/setup';

export const renderTab = ( component, tab = '' ) => ( context, next ) => {
	context.primary = <Settings tab={ tab }>{ React.createElement( component ) }</Settings>;
	next();
};

export const renderSetupWizard = ( context, next ) => {
	const stepName = get( context, [ 'params', 'stepName' ] );

	context.primary = <SetupWizard stepName={ stepName } />;
	next();
};
