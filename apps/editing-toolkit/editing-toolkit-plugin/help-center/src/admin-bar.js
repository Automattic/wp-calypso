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
			adminUrl={ window.helpCenterData.admin_url }
			isJetpackSite={ window.helpCenterData.currentSite.jetpack }
			locale={ window.helpCenterData.locale }
			sectionName="wp-admin"
			currentUserId={ window.helpCenterData.current_user_id }
			selectedSiteId={ window.helpCenterData.current }
			hasPurchases={ false }
			primarySiteId={ window.helpCenterData.primary_site_id }
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
