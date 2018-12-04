/**
 * External dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { PostTypeSupportCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './jetpack-plugin-sidebar.scss';
import JetpackLogo from 'components/jetpack-logo';

const { Fill, Slot } = createSlotFill( 'JetpackPluginSidebar' );

const JetpackPluginSidebar = ( { children } ) => (
	<Fill>
		{ children }
	</Fill>
);

JetpackPluginSidebar.Slot = () => (
		<PostTypeSupportCheck supportKeys="publicize">
			<PluginSidebarMoreMenuItem target="jetpack" icon={ <JetpackLogo /> }>
				Jetpack
			</PluginSidebarMoreMenuItem>
			<PluginSidebar name="jetpack" title="Jetpack" icon={ <JetpackLogo /> }>
				<Slot />
			</PluginSidebar>
		</PostTypeSupportCheck>
);

registerPlugin( 'jetpack-sidebar', {
	render: () => <JetpackPluginSidebar.Slot />
} );

export default JetpackPluginSidebar;
