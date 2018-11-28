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
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const { Fill, Slot } = createSlotFill( 'JetpackPluginSidebar' );

const JetpackIcon = () => <JetpackLogo />;

const JetpackPluginSidebar = ( { children } ) => (
	<Fill>
		{ children }
	</Fill>
);

JetpackPluginSidebar.Slot = () => (
	<Fragment>
		<PluginSidebarMoreMenuItem target="jetpack" icon={ <JetpackIcon /> }>
			{ __( 'Jetpack' ) }
		</PluginSidebarMoreMenuItem>
		<PluginSidebar name="jetpack" title={ __( 'Jetpack' ) } icon={ <JetpackIcon /> }>
			<Slot />
		</PluginSidebar>
	</Fragment>
);

registerPlugin( 'jetpack-sidebar', {
	render: () => <JetpackPluginSidebar.Slot />
} );

export default JetpackPluginSidebar;
