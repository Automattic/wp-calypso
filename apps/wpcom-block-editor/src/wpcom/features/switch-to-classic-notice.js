/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
/* eslint-enable import/no-extraneous-dependencies */

const PluginDocumentSettingPanelDemo = () => (
	<PluginDocumentSettingPanel
		name="switch-to-classic"
		title="Switch to Classic Editor"
		className="features__switch-to-classic"
	>
		<h2>{ __( 'You are using the most modern WordPress editor yet.' ) }</h2>
		<p>{ __( "If you'd prefer you canswitch back to the Classic Editor" ) } </p>
	</PluginDocumentSettingPanel>
);
registerPlugin( 'plugin-document-setting-panel-demo', {
	render: PluginDocumentSettingPanelDemo,
	icon: null,
} );
