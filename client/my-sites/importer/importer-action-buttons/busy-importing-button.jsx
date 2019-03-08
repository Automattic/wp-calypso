/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ActionButton from './action-button';

export const StopButton = ( { translate } ) => (
	<ActionButton primary busy>
		{ translate( 'Importing…' ) }
	</ActionButton>
);

export default localize( StopButton );
