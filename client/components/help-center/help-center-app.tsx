import config from '@automattic/calypso-config';
import { HelpCenter as HelpCenterStore } from '@automattic/data-stores';
import HelpCenter from '@automattic/help-center';
import { useDispatch } from '@wordpress/data';
import React, { useCallback } from 'react';
import './help-center-app.scss';

export type HelpCenterAppProps = React.ComponentProps< typeof HelpCenter >;

const HELP_CENTER_STORE = HelpCenterStore.register();

const HelpCenterApp = ( props: HelpCenterAppProps ) => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	return (
		<HelpCenter
			onboardingUrl={ config( 'wpcom_signup_url' ) }
			handleClose={ handleClose }
			{ ...props }
		/>
	);
};

export default HelpCenterApp;
