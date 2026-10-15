/**
 * WP Admin connected variant entry point.
 *
 * Mounts the Agents Manager dock into the admin bar node. Admin screens with no
 * admin bar (e.g. iframe requests) render no node, so there is nothing to mount.
 */
import './config';
import { installWpAdminSettingsSync } from '@automattic/agents-manager/src/utils/wp-admin-settings-sync';
import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const masterbarTarget = document.getElementById( 'agents-manager-masterbar' );

if ( masterbarTarget ) {
	installWpAdminSettingsSync();
	createRoot( masterbarTarget ).render( <AgentsManagerWithProvider /> );
}
