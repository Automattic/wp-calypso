/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill } from '@wordpress/components';

const WhatsNew = () => (
	<Fill name="ToolsMoreMenuGroup">
		<p>What's New copy 2</p>
	</Fill>
);

export default WhatsNew;

registerPlugin( 'whats-new', {
	render() {
		return <WhatsNew />;
	},
} );
