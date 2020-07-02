/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __experimentalMainDashboardButton as MainDashboardButton } from '@wordpress/interface';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import WpcomBlockEditorNavSidebar from './components/nav-sidebar';
import ToggleSidebarButton from './components/toggle-sidebar-button';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-full-site-editing-nav-sidebar', {
	render: function NavSidebar() {
		const { addEntities } = useDispatch( 'core' );
		const isSidebarOpened = useSelect( ( select ) => select( STORE_KEY ).isSidebarOpened() );

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

		// TODO: remove this effect once sidebar opens over the editor and doesn't
		// squish the editor content.
		useEffect( () => {
			// Classes need to be attached to elements that aren't controlled by React,
			// otherwise our alterations will be removed when React re-renders. So attach
			// to <body> element.
			document.body.classList.add( 'is-wpcom-block-editor-nav-sidebar-attached' );
		}, [] );

		// TODO: remove this effect once sidebar opens over the editor and doesn't
		// squish the editor content.
		useEffect( () => {
			if ( isSidebarOpened ) {
				document.body.classList.add( 'is-wpcom-block-editor-nav-sidebar-opened' );
			} else {
				document.body.classList.remove( 'is-wpcom-block-editor-nav-sidebar-opened' );
			}
		}, [ isSidebarOpened ] );

		return (
			<MainDashboardButton>
				<ToggleSidebarButton />
				<WpcomBlockEditorNavSidebar />
			</MainDashboardButton>
		);
	},
} );
