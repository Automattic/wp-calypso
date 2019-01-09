/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { PluginPrePublishPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import './editor.scss';
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import SeoPanel from './panel';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'seo';

export const settings = {
	render: () => (
		<Fragment>
			<JetpackPluginSidebar>
				<PanelBody title={ __( 'SEO Description' ) }>
					<SeoPanel />
				</PanelBody>
			</JetpackPluginSidebar>
			<PluginPrePublishPanel
				initialOpen
				id="seo-title"
				title={
					<span id="seo-defaults" key="seo-title-span">
						{ __( 'SEO Description' ) }
					</span>
				}
			>
				<SeoPanel />
			</PluginPrePublishPanel>
		</Fragment>
	),
};
