import { recordTracksEvent } from '@automattic/calypso-analytics';
import WhatsNewGuide from '@automattic/whats-new';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Fill, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from 'react';

function WhatsNewApp( { siteId } ) {
	const [ showGuide, setShowGuide ] = useState( false );
	const { setHasSeenWhatsNewModal } = useDispatch( 'automattic/help-center' );

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
			{ showGuide && <WhatsNewGuide onClose={ closeWhatsNew } siteId={ siteId } /> }
		</>
	);
}

registerPlugin( 'whats-new', {
	render: () => {
		if ( ! window.whatsNewAppConfig ) {
			// Can't load the whats new app without a config.
			return null;
		}

		return (
			<QueryClientProvider client={ new QueryClient() }>
				<WhatsNewApp { ...( window.whatsNewAppConfig || {} ) } />
			</QueryClientProvider>
		);
	},
} );
