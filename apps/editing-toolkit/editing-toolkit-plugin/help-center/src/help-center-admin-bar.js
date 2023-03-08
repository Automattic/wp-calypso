import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter as HelpCenterStore } from '@automattic/data-stores';
import HelpCenter from '@automattic/help-center';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import * as ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';
import './help-center.scss';

HelpCenterStore.register();

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

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: 'wp-admin',
		} );

		setShowHelpCenter( ! show );
	};

	button.onclick = handleToggleHelpCenter;

	return <HelpCenter handleClose={ () => setShowHelpCenter( false ) } />;
}

if ( window?.helpCenterAdminBar?.isLoaded ) {
	ReactDOM.render(
		<QueryClientProvider client={ whatsNewQueryClient }>
			<CalypsoStateProvider>
				<AdminHelpCenterContent />
			</CalypsoStateProvider>
		</QueryClientProvider>,
		document.getElementById( 'help-center-masterbar' )
	);
}
