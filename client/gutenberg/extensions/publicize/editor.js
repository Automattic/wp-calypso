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
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './editor.scss';
import PublicizePanel from './panel';
import publicizeStore from './gutenberg-store';

const PluginRender = () => (
	<PluginPrePublishPanel>
		<PublicizePanel />
	</PluginPrePublishPanel>
);

registerPlugin( 'jetpack-publicize', {
	render: PluginRender
} );

registerStore( 'jetpack/publicize', publicizeStore );
