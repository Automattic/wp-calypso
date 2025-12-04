import { AgentUI } from '@automattic/agenttic-ui';
import { HelpCenterArticle } from '@automattic/help-center';
import { __ } from '@wordpress/i18n';
import ChatHeader, { Options } from '../chat-header';
import './style.scss';

export default function SupportGuide( {
	isOpen,
	chatHeaderOptions,
	isChatDocked,
	onAbort,
	onClose,
}: {
	chatHeaderOptions: Options;
	isChatDocked: boolean;
	isOpen: boolean;
	onAbort: () => void;
	onClose: () => void;
} ) {
	function handleSubmit( value: string ) {
		// eslint-disable-next-line no-console
		console.log( 'Submitted message:', value );
	}

	return (
		<AgentUI.Container
			className="agenttic"
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ handleSubmit }
			variant={ isChatDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onStop={ onAbort }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isChatDocked }
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ __( 'Support Guides', '__i18n_text_domain__' ) }
				/>
				<div className="agenttic agent-manager-support-guide-wrapper">
					<div className="agent-manager-support-guide-content help-center__container-content">
						<HelpCenterArticle />
					</div>
					{ /*
					<div className="agent-manager-support-guide-footer">
						<AgentUI.Footer />
					</div>
					 */ }
				</div>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
