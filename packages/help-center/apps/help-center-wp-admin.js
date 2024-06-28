import './config';

/* global helpCenterData */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
import HelpCenter from '../src/components/help-center';
const queryClient = new QueryClient();
import './help-center.scss';

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
		<QueryClientProvider client={ queryClient }>
			<HelpCenter
				locale={ helpCenterData.locale }
				sectionName="wp-admin"
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
			/>
		</QueryClientProvider>
	);
}

const target = document.getElementById( 'help-center-masterbar' );
createRoot( target ).render( <AdminHelpCenterContent /> );
