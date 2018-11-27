/** @format */

/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-publish flow.
 *
 * It also creates a dedicated PluginSidebar for Jetpack and
 * displays the Publicize UI there.
 */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import {
	PluginPrePublishPanel,
	PluginSidebar,
	PluginSidebarMoreMenuItem,
} from '@wordpress/edit-post';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import JetpackLogo from 'components/jetpack-logo';
import PublicizePanel from './panel';
import registerJetpackPlugin from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-plugin';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'publicize';

export const settings = {
	render: () => (
		<Fragment>
			<PluginSidebarMoreMenuItem target="jetpack" icon={ <JetpackLogo size={ 24 } /> }>
				{ __( 'Jetpack' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar name="jetpack" title={ __( 'Jetpack' ) } icon={ <JetpackLogo size={ 24 } /> }>
				<PanelBody>
					<PublicizePanel />
				</PanelBody>
			</PluginSidebar>
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
		</Fragment>
	),
};

registerJetpackPlugin( name, settings );
