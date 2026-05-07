/* global __i18n_text_domain__ */
import './config';
import { LiveAIAssistant, MicIcon } from '@automattic/wpcom-smart-dictation';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

const SMART_DICTATION_SIDEBAR_NAME = 'wpcom-smart-dictation';
const MicrophoneIcon = () => <MicIcon animated size={ 20 } />;

function WpcomSmartDictationPlugin() {
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

registerPlugin( 'wpcom-smart-dictation', {
	icon: MicrophoneIcon,
	render: () => <WpcomSmartDictationPlugin />,
} );
