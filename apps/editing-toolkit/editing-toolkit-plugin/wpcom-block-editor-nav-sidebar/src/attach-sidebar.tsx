/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, createPortal, useState } from '@wordpress/element';
import { __experimentalMainDashboardButton as MainDashboardButton } from '@wordpress/interface';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import WpcomBlockEditorNavSidebar from './components/nav-sidebar';
import ToggleSidebarButton from './components/toggle-sidebar-button';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	originalRegisterPlugin( name, settings as any );

if ( typeof MainDashboardButton !== 'undefined' ) {
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

			const [ clickGuardRoot ] = useState( () => document.createElement( 'div' ) );
			useEffect( () => {
				document.body.appendChild( clickGuardRoot );
				return () => {
					document.body.removeChild( clickGuardRoot );
				};
			} );

			// Uses presence of data store to detect whether this is the experimental site editor.
			const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );

			// Disable sidebar nav if the editor is not in fullscreen mode
			const isFullscreenActive = useSelect( ( select ) =>
				select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' )
			);

			if ( isSiteEditor || ! isFullscreenActive ) {
				return null;
			}

			return (
				<MainDashboardButton>
					<ToggleSidebarButton />
					{ createPortal( <WpcomBlockEditorNavSidebar />, clickGuardRoot ) }
				</MainDashboardButton>
			);
		},
	} );
}
