/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-publish flow.
 */

/**
 * External dependencies
 */
import { PluginPrePublishPanel } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './editor.scss';
import './store/index';
import PublicizePanel from './panel';

const PluginRender = () => (
	<PluginPrePublishPanel>
		<PublicizePanel />
	</PluginPrePublishPanel>
);

registerPlugin( 'jetpack-publicize', {
	render: PluginRender
} );
