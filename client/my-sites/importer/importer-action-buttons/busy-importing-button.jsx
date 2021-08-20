import { localize } from 'i18n-calypso';
import React from 'react';
import ImporterActionButton from './action-button';

export const BusyImportingButton = ( { translate } ) => (
	<ImporterActionButton primary busy disabled>
		{ translate( 'Importing…' ) }
	</ImporterActionButton>
);

export default localize( BusyImportingButton );
