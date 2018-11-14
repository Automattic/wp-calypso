/** @format */

/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-publish flow.
 */

/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './editor.scss';
import PublicizePanel from './panel';

registerPlugin( 'jetpack-publicize', {
	render: () => <PublicizePanel />,
} );
