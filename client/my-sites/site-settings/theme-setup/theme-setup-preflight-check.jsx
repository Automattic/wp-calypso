/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

const ThemeSetupPreflightCheck = ( { translate } ) => (
	<div>{ translate( 'Preflighting...' ) }</div>
);

export default localize( ThemeSetupPreflightCheck );

