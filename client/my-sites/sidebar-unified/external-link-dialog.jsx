/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

export const ExternalLinkDialog = ( { isVisible, closeModalHandler } ) => {
	return (
		<Dialog
			isVisible={ isVisible }
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
					'There is a Support Chat session in progress. Clicking OK will open this link in a new tab.'
				) }
			</p>
			<p>{ translate( 'Please come back to this tab to continue chatting.' ) }</p>
		</Dialog>
	);
};

export default ExternalLinkDialog;
