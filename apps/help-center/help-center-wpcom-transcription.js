/* global __i18n_text_domain__ */
import './config';
import { LiveAIAssistant } from '@automattic/help-center';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import './help-center.scss';

const SMART_DICTATION_SIDEBAR_NAME = 'wpcom-smart-dictation';

const MicrophoneIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
		<path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
	</svg>
);

function JetpackSmartDictationPlugin() {
	return (
		<>
			<PluginSidebarMoreMenuItem target={ SMART_DICTATION_SIDEBAR_NAME } icon={ MicrophoneIcon }>
				{ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={ SMART_DICTATION_SIDEBAR_NAME }
				title={ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
				icon={ MicrophoneIcon }
			>
				<div className="wpcom-smart-dictation-sidebar-root">
					<LiveAIAssistant layout="sidebar" />
				</div>
			</PluginSidebar>
		</>
	);
}

registerPlugin( 'jetpack-live-ai-assistant', {
	icon: MicrophoneIcon,
	render: () => <JetpackSmartDictationPlugin />,
} );
