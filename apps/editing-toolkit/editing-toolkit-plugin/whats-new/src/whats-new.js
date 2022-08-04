/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import WhatsNewGuide from '@automattic/whats-new';
import { Fill, MenuItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from 'react';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';

function WhatsNewMenuItem() {
	const [ showGuide, setShowGuide ] = useState( false );
	const { setHasSeenWhatsNewModal } = useHasSeenWhatsNewModalQuery( window._currentSiteId );

	const openWhatsNew = () => {
		setHasSeenWhatsNewModal( true ).finally( () => setShowGuide( true ) );
	};
	const closeWhatsNew = () => setShowGuide( false );

	// Record Tracks event if user opens What's New
	useEffect( () => {
		if ( showGuide ) {
			recordTracksEvent( 'calypso_block_editor_whats_new_open' );
		}
	}, [ showGuide ] );

	return (
		<>
			<Fill name="ToolsMoreMenuGroup">
				<MenuItem onClick={ openWhatsNew }>{ __( "What's new", 'full-site-editing' ) }</MenuItem>
			</Fill>
			{ showGuide && <WhatsNewGuide onClose={ closeWhatsNew } /> }
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
