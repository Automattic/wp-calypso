import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import * as ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';

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
		if ( show ) {
			recordTracksEvent( 'calypso_inlinehelp_close', {
				location: 'help-center-dashboard',
				sectionName: 'wp-admin',
			} );
		} else {
			recordTracksEvent( 'calypso_inlinehelp_show', {
				location: 'help-center-dashboard',
				sectionName: 'wp-admin',
			} );
		}
		setShowHelpCenter( ! show );
	};

	button.onclick = handleToggleHelpCenter;

	return <HelpCenter handleClose={ () => setShowHelpCenter( false ) } />;
}

ReactDOM.render(
	<QueryClientProvider client={ whatsNewQueryClient }>
		<CalypsoStateProvider>
			<AdminHelpCenterContent />
		</CalypsoStateProvider>
	</QueryClientProvider>,
	document.getElementById( 'help-center-masterbar' )
);
