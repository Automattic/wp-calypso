import config from '@automattic/calypso-config';
import { HelpCenter as HelpCenterStore } from '@automattic/data-stores';
/**
 * The app ensures Webpack treats this Help Center as separate from the one in the main client app.
 * Without it, Webpack would create one shared chunk, loaded in both apps. Since HelpCenterApp is smaller, more CSS would
 * need be bundled into that shared chunk. This is great for HelpCenterApp, but it duplicates the CSS in the main client app.
 * See: #97480
 */
import HelpCenter from '@automattic/help-center/app';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import type { HelpCenterAppProps } from './types';
import './help-center-app.scss';

const HELP_CENTER_STORE = HelpCenterStore.register();

const HelpCenterApp = ( { user, onClose }: HelpCenterAppProps ) => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
		onClose?.();
	}, [ setShowHelpCenter, onClose ] );

	return (
		<HelpCenter
			currentUser={ user }
			onboardingUrl={ config( 'wpcom_signup_url' ) }
			handleClose={ handleClose }
		/>
	);
};

export default HelpCenterApp;
