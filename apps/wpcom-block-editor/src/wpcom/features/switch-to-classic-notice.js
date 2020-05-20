/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import url from 'url';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( window.location.href, true );

const classicEditorUrl = `${ parsedEditorUrl.protocol }//${ parsedEditorUrl.hostname }${ parsedEditorUrl.pathname }?post=${ parsedEditorUrl.query.post }&action=${ parsedEditorUrl.query.action }&set-editor=classic`;

const PluginDocumentSettingPanelDemo = () => (
	<PluginDocumentSettingPanel
		name="switch-to-classic"
		title="Switch to Classic Editor"
		className="features__switch-to-classic"
	>
		<h2>{ __( 'You are using the most modern WordPress editor yet.' ) }</h2>
		<p>
			If you'd prefer you can switch back to the
			<a target="_top" href={ classicEditorUrl }>
				Classic Editor
			</a>
		</p>
	</PluginDocumentSettingPanel>
);

// Need to replace this check with one that checks for a classicEditorUrl.query param - we need to pass through a
// a custom query param from calyps to identify group to show this option to as outlined in
// https://github.com/Automattic/wp-calypso/issues/41087.
if ( 1 === 1 ) {
	registerPlugin( 'plugin-document-setting-panel-demo', {
		render: PluginDocumentSettingPanelDemo,
		icon: null,
	} );
}
