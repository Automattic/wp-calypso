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

/**
 * Internal dependencies
 */
const { PluginPrePublishPanel } = window.wp.editPost.__experimental;
const { registerPlugin } = window.wp.plugins;
import PublicizePanel from './publicize-panel';
import publicizeStore from './publicize-gutenberg-store';
const { data } = window.wp;
const { registerStore } = data;

const PluginRender = () => (
	<PluginPrePublishPanel>
		<PublicizePanel />
	</PluginPrePublishPanel>
);

registerPlugin( 'jetpack-publicize', {
	render: PluginRender
} );

registerStore( 'jetpack/publicize', publicizeStore );
