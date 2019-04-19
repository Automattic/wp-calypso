/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ImporterActionButtonContainer from 'my-sites/importer/importer-action-buttons/container';
import BusyImportingButton from 'my-sites/importer/importer-action-buttons/busy-importing-button';

export const FromSignupLandingPane = ( { translate } ) => (
	<div>
		<p>
			{ translate(
				'Thanks for choosing WordPress.com, ' +
					'give us a moment while we get started importing your content!'
			) }
		</p>
		<ImporterActionButtonContainer>
			<BusyImportingButton />
		</ImporterActionButtonContainer>
	</div>
);

export default localize( FromSignupLandingPane );
