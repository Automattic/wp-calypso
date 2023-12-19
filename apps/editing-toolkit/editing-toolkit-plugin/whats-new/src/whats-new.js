/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { Fill, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { whatsNewQueryClient } from '../../common/what-new-query-client';

function WhatsNewMenuItem() {
	const { setHasSeenWhatsNewModal } = useDispatch( 'automattic/help-center' );

	const openWhatsNew = () => {
		recordTracksEvent( 'calypso_block_editor_whats_new_open' );
		setHasSeenWhatsNewModal( true );
		window.open( localizeUrl( 'https://wordpress.com/blog/', '_blank' ) );
	};

	return (
		<Fill name="ToolsMoreMenuGroup">
			<MenuItem onClick={ openWhatsNew }>{ __( "What's new", 'full-site-editing' ) }</MenuItem>
		</Fill>
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
