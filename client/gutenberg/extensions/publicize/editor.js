/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel and PluginSidebar
 * to display Jetpack's Publicize UI in the pre-publish flow and
 * as a regular plugin extension.
 *
 * @since  5.9.1
 */

/**
 * External dependencies
 */
import wp from 'wp';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizePanel from './panel';
import publicizeStore from './gutenberg-store';
import JetpackLogo from 'components/jetpack-logo';

/**
 * Module variables
 */
const {
	PluginPrePublishPanel,
	PluginSidebar,
	PluginSidebarMoreMenuItem,
} = wp.editPost;

const PluginRender = () => (
	<Fragment>
		<PluginSidebarMoreMenuItem
			target="jetpack"
			icon={ <JetpackLogo size={ 24 } /> }
		>
			{ __( 'Jetpack' ) }
		</PluginSidebarMoreMenuItem>
		<PluginSidebar
			name="jetpack"
			title={ __( 'Jetpack' ) }
			icon={ <JetpackLogo size={ 24 } /> }
		>
			<PublicizePanel />
		</PluginSidebar>
		<PluginPrePublishPanel>
			<PublicizePanel />
		</PluginPrePublishPanel>
	</Fragment>
);

registerPlugin( 'a8c-publicize', {
	render: PluginRender
} );

registerStore( 'a8c/publicize', publicizeStore );
