/**
 * External dependencies
 */
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DomainPicker from './domain-picker';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { Icon, globe } from '@wordpress/icons';
const ICON = <Icon icon={ globe } />;
const PLUGIN_SIDEBAR_NAME = 'a8c-domain-sidebar';

registerPlugin( PLUGIN_SIDEBAR_NAME, {
	render: () => (
		<>
			<PluginSidebarMoreMenuItem target={ PLUGIN_SIDEBAR_NAME } icon={ ICON } />
			<PluginSidebar name={ PLUGIN_SIDEBAR_NAME } title={ __( 'Domains' ) } icon={ ICON }>
				<DomainPicker />
			</PluginSidebar>
		</>
	),
} );
