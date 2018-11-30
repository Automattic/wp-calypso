/**
 * External dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';

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
	<Fragment>
		<PluginSidebarMoreMenuItem target="jetpack" icon={ <JetpackLogo /> }>
			Jetpack
		</PluginSidebarMoreMenuItem>
		<PluginSidebar name="jetpack" title="Jetpack" icon={ <JetpackLogo /> }>
			<Slot />
		</PluginSidebar>
	</Fragment>
);

registerPlugin( 'jetpack-sidebar', {
	render: () => <JetpackPluginSidebar.Slot />
} );

export default JetpackPluginSidebar;
