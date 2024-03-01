/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import WhatsNewGuide from '@automattic/whats-new';
import { QueryClientProvider } from '@tanstack/react-query';
import { Fill, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { whatsNewQueryClient } from '../../common/what-new-query-client';

function WhatsNewMenuItem() {
	const siteId = window.whatsNewData?.currentSiteId;

	const { setHasSeenWhatsNewModal, setShowWhatsNewModal } = useDispatch( 'automattic/help-center' );

	const openWhatsNew = () => {
		setHasSeenWhatsNewModal( true ).finally( () => {
			// Record Tracks event if user opens What's New
			recordTracksEvent( 'calypso_block_editor_whats_new_open' );
			setShowWhatsNewModal( true );
		} );
	};

	const handleCloseWhatsNew = () => {
		setShowWhatsNewModal( false );
	};

	return (
		<>
			<Fill name="ToolsMoreMenuGroup">
				<MenuItem onClick={ openWhatsNew }>{ __( "What's new", 'full-site-editing' ) }</MenuItem>
			</Fill>
			<WhatsNewGuide onClose={ handleCloseWhatsNew } siteId={ siteId } />
		</>
	);
}

export default WhatsNewMenuItem;

registerPlugin( 'whats-new', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<WhatsNewMenuItem />,
			</QueryClientProvider>
		);
	},
} );
