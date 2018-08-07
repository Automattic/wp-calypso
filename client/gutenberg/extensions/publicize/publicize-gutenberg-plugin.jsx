/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginSidebarMoreMenuItem
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
const {
	PluginPrePublishPanel,
	PluginSidebar,
	PluginSidebarMoreMenuItem,
} = wp.editPost;
const { registerPlugin } = wp.plugins;
const { __ } = wp.i18n;
const { Fragment } = wp.element;

const PluginRender = () => (
	<Fragment>
		<PluginSidebarMoreMenuItem
			target="jetpack"
		>
			{ __( 'Jetpack' ) }
		</PluginSidebarMoreMenuItem>
		<PluginSidebar
			name="jetpack"
			title={ __( 'Jetpack' ) }
		>
			<PublicizePanel />
		</PluginSidebar>
		<PluginPrePublishPanel>
			<PublicizePanel />
		</PluginPrePublishPanel>
	</Fragment>
);

registerPlugin( 'jetpack-publicize', {
	render: PluginRender
} );

registerStore( 'jetpack/publicize', publicizeStore );
