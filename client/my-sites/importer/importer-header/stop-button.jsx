/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';

export const StopButton = ( { translate } ) => (
	<Button className="importer-header__action-button" disabled isPrimary scary>
		{ translate( 'Importing…' ) }
	</Button>
);

export default localize( StopButton );
