/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { WhatsNew as WhatsNewStore } from '@automattic/data-stores';
import WhatsNewGuide from '@automattic/whats-new';

/**
 * Internal dependencies
 */
import './style.scss';

function WhatsNewMenuItem() {
	const WHATS_NEW_STORE = WhatsNewStore.register();
	const { toggleWhatsNew } = useDispatch( WHATS_NEW_STORE );

	return (
		<>
			<Fill name="ToolsMoreMenuGroup">
				<MenuItem onClick={ toggleWhatsNew }>{ __( "What's new", 'full-site-editing' ) }</MenuItem>
			</Fill>
			<WhatsNewGuide />
		</>
	);
}

export default WhatsNewMenuItem;

registerPlugin( 'whats-new', {
	render() {
		return <WhatsNewMenuItem />;
	},
} );
