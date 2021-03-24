/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fill, MenuItem } from '@wordpress/components';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { registerPlugin } from '@wordpress/plugins';
import { useEffect } from '@wordpress/element';
import { useState } from 'react';
import WhatsNewGuide from '@automattic/whats-new';

function WhatsNewMenuItem() {
	const [ showGuide, setShowGuide ] = useState( false );
	const openWhatsNew = () => setShowGuide( true );
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
	render() {
		return <WhatsNewMenuItem />;
	},
} );
