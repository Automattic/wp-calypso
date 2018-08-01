/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-
 * publish flow.
 *
 * @since  5.9.1
 */

/**
 * External dependencies
 */
import React from 'react';
import wp from 'wp';

/**
 * Internal dependencies
 */
import PublicizePanel from './publicize-panel';
import publicizeStore from './publicize-gutenberg-store';

/**
 * Module variables
 */
const { data } = wp;
const { registerStore } = data;
const { PluginPrePublishPanel } = wp.editPost;
const { registerPlugin } = wp.plugins;

const PluginRender = () => (
	<PluginPrePublishPanel>
		<PublicizePanel />
	</PluginPrePublishPanel>
);

registerPlugin( 'jetpack-publicize', {
	render: PluginRender
} );

registerStore( 'jetpack/publicize', publicizeStore );
