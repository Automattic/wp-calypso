/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ImporterActionButton from './action-button';

export const StopButton = ( { translate } ) => (
	<ImporterActionButton primary busy>
		{ translate( 'Importing…' ) }
	</ImporterActionButton>
);

export default localize( StopButton );
