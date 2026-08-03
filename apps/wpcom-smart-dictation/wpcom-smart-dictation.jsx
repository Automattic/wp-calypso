/* global __i18n_text_domain__ */
import './config';
import { LiveAIAssistant, MicIcon } from '@automattic/wpcom-smart-dictation';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

const SMART_DICTATION_SIDEBAR_NAME = 'wpcom-smart-dictation';
const MicrophoneIcon = ( { width = 20 } ) => <MicIcon animated size={ width } />;

function WpcomSmartDictationPlugin() {
	return (
		<>
			<PluginSidebarMoreMenuItem
				target={ SMART_DICTATION_SIDEBAR_NAME }
				icon={ MicrophoneIcon( { width: 14 } ) }
			>
				{ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={ SMART_DICTATION_SIDEBAR_NAME }
				title={ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
				icon={ MicrophoneIcon }
				isPinnable={ false }
			>
				<div className="wpcom-smart-dictation-sidebar-root">
					<LiveAIAssistant />
				</div>
			</PluginSidebar>
		</>
	);
}

registerPlugin( 'wpcom-smart-dictation', {
	icon: MicrophoneIcon,
	render: () => <WpcomSmartDictationPlugin />,
} );
