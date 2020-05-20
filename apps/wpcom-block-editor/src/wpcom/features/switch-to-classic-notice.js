/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import url from 'url';
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

const parsedEditorUrl = url.parse( window.location.href, true );
// just temporarily using the 'action' query param - we need to pass through a custom query param
// to identify group to show this option to as outlined in https://github.com/Automattic/wp-calypso/issues/41087.
if ( parsedEditorUrl.query.action ) {
	registerPlugin( 'plugin-document-setting-panel-demo', {
		render: PluginDocumentSettingPanelDemo,
		icon: null,
	} );
}
