import { Dialog } from '@automattic/components';
import { translate } from 'i18n-calypso';

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
					label: translate( 'Continue' ),
					isPrimary: true,
					onClick: () => closeModalHandler( true ),
				},
			] }
			onClose={ () => closeModalHandler( false ) }
		>
			<p>
				{ translate(
					'A support chat session is currently in progress. Click continue to open this link in a new tab.'
				) }
			</p>
		</Dialog>
	);
};

export default ExternalLinkDialog;
