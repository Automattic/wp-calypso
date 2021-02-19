/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

export const ExternalLinkDialog = ( { closeModalHandler } ) => {
	return (
		<Dialog
			isVisible={ true }
			buttons={ [
				{
					action: 'cancel',
					label: translate( 'Cancel' ),
					isPrimary: false,
					onClick: () => closeModalHandler( false ),
				},
				{
					action: 'ok',
					label: translate( 'OK' ),
					isPrimary: true,
					onClick: () => closeModalHandler( true ),
				},
			] }
			onClose={ () => closeModalHandler( false ) }
		>
			<p>
				{ translate(
					'There is a Chat session in progress. Clicking OK will open this link in a new tab.'
				) }
			</p>
			<p>{ translate( 'Please come back to this tab to continue.' ) }</p>
		</Dialog>
	);
};

export default ExternalLinkDialog;
