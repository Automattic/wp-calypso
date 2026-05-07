/* global __i18n_text_domain__ */
import './config';
import { LiveAIAssistant, MicIcon } from '@automattic/help-center';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import './help-center.scss';

const SMART_DICTATION_SIDEBAR_NAME = 'wpcom-smart-dictation';
const MicrophoneIcon = () => <MicIcon animated size={ 20 } />;

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
