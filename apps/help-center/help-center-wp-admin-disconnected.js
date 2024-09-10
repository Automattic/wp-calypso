import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { createRoot } from 'react-dom/client';
import './help-center.scss';

function AdminHelpCenterContent() {
	const button = document.getElementById( 'wp-admin-bar-help-center' );

	const handleOpenHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_show`, {
			force_site_id: true,
			location: 'help-center',
			section: 'wp-admin',
			jetpack_disconnected_site: true,
		} );
	};

	button.onclick = handleOpenHelpCenter;
}

const target = document.getElementById( 'help-center-masterbar' );
createRoot( target ).render( <AdminHelpCenterContent /> );
