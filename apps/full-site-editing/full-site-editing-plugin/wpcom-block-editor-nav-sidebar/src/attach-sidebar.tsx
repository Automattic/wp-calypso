/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __experimentalMainDashboardButton as MainDashboardButton } from '@wordpress/interface';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import WpcomBlockEditorNavSidebar from './components/nav-sidebar';
import ToggleSidebarButton from './components/toggle-sidebar-button';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-full-site-editing-nav-sidebar', {
	render: function NavSidebar() {
		const { addEntities } = useDispatch( 'core' );

		useEffect( () => {
			// Teach core data about the status entity so we can use selectors like `getEntityRecords()`
			addEntities( [
				{
					baseURL: '/wp/v2/statuses',
					key: 'slug',
					kind: 'root',
					name: 'status',
					plural: 'statuses',
				},
			] );

			// Only register entity once
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		return (
			<MainDashboardButton>
				<ToggleSidebarButton />
				<WpcomBlockEditorNavSidebar />
			</MainDashboardButton>
		);
	},
} );
