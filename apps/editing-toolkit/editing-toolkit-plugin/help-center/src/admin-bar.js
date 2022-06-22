import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { useDispatch, useSelect } from '@wordpress/data';
import * as ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';

function AdminHelpCenterContent() {
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );
	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );

	const handleToggleHelpCenter = () => {
		if ( show ) {
			recordTracksEvent( 'calypso_inlinehelp_close', { location: 'help-center-desktop' } );
		} else {
			recordTracksEvent( 'calypso_inlinehelp_show', { location: 'help-center-desktop' } );
		}
		setShowHelpCenter( ! show );
	};

	const button = document.getElementById( 'help-center__icon' );
	button.onclick = handleToggleHelpCenter;

	return <>{ show && <HelpCenter handleClose={ () => setShowHelpCenter( false ) } /> }</>;
}

ReactDOM.render(
	<QueryClientProvider client={ whatsNewQueryClient }>
		<CalypsoStateProvider>
			<AdminHelpCenterContent />
		</CalypsoStateProvider>
	</QueryClientProvider>,
	document.getElementById( 'help-center' )
);
