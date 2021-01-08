/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { ToolsMoreMenuGroup } from '@wordpress/edit-post';

const WhatsNew = () => (
	<ToolsMoreMenuGroup>
		<p>What's New copy 2</p>
	</ToolsMoreMenuGroup>
);

export default WhatsNew;

registerPlugin( 'whats-new', {
	render() {
		return <WhatsNew />;
	},
} );
