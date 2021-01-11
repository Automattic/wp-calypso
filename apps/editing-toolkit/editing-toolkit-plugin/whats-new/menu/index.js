/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const WhatsNew = () => (
	<Fill name="ToolsMoreMenuGroup">
		<MenuItem>{ __( "What's New copy 2", 'full-site-editing' ) }</MenuItem>
	</Fill>
);

export default WhatsNew;

registerPlugin( 'whats-new', {
	render() {
		return <WhatsNew />;
	},
} );
