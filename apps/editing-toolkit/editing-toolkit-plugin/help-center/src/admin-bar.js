/* global helpCenterData */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import * as ReactDOM from 'react-dom';
import { whatsNewQueryClient } from '../../common/what-new-query-client';

function AdminHelpCenterContent() {
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );
	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );
	const button = document.getElementById( 'wp-admin-bar-help-center' );

	useEffect( () => {
		if ( show ) {
			button.classList.add( 'active' );
		} else {
			button.classList.remove( 'active' );
		}
	}, [ show, button ] );

	const closeCallback = useCallback( () => setShowHelpCenter( false ), [ setShowHelpCenter ] );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: 'wp-admin',
		} );

		setShowHelpCenter( ! show );
	};

	button.onclick = handleToggleHelpCenter;

	return (
		<HelpCenter
			locale={ helpCenterData.locale }
			sectionName="gutenberg-editor"
			currentUser={ helpCenterData.currentUser }
			site={ helpCenterData.currentSite }
			hasPurchases={ false }
			onboardingUrl="https://wordpress.com/start"
			adminUrl={ helpCenterData.adminUrl }
			handleClose={ closeCallback }
		/>
	);
}

if ( window?.helpCenterAdminBar?.isLoaded ) {
	ReactDOM.render(
		<QueryClientProvider client={ whatsNewQueryClient }>
			<AdminHelpCenterContent />
		</QueryClientProvider>,
		document.getElementById( 'help-center-masterbar' )
	);
}
