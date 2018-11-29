/** @format */

/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-publish flow.
 *
 * It also hooks into our dedicated Jetpack plugin sidebar and
 * displays the Publicize UI there.
 */

/**
 * External dependencies
 */
import { PanelBody } from '@wordpress/components';
import { PluginPrePublishPanel } from '@wordpress/edit-post';
import { PostTypeSupportCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import PublicizePanel from './panel';
import registerJetpackPlugin from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-plugin';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'publicize';

export const settings = {
	render: () => (
		<PostTypeSupportCheck supportKeys="publicize">
			<JetpackPluginSidebar>
				<PanelBody title={ __( 'Share this post' ) }>
					<PublicizePanel />
				</PanelBody>
			</JetpackPluginSidebar>
			<PluginPrePublishPanel
				initialOpen={ true }
				id="publicize-title"
				title={
					<span id="publicize-defaults" key="publicize-title-span">
						{ __( 'Share this post' ) }
					</span>
				}
			>
				<PublicizePanel />
			</PluginPrePublishPanel>
		</PostTypeSupportCheck>
	),
};

registerJetpackPlugin( name, settings );
