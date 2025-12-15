import { AgentUI } from '@automattic/agenttic-ui';
import { HelpCenterArticle } from '@automattic/support-articles';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatHeader, { Options } from '../chat-header';
import './style.scss';

export default function SupportGuide( {
	isOpen,
	chatHeaderOptions,
	isChatDocked,
	onAbort,
	onClose,
	currentSiteDomain,
	sectionName,
	isEligibleForChat,
}: {
	chatHeaderOptions: Options;
	isChatDocked: boolean;
	isOpen: boolean;
	onAbort: () => void;
	onClose: () => void;
	currentSiteDomain?: string;
	sectionName: string;
	isEligibleForChat: boolean;
} ) {
	const navigate = useNavigate();
	const location = useLocation().search;
	const query = new URLSearchParams( location );
	const isFromChat = query.has( 'from-chat' );

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
					onBack={ () => navigate( -1 ) }
					options={ chatHeaderOptions }
					title={ __( 'Support Guides', '__i18n_text_domain__' ) }
				/>
				<div className="agenttic agent-manager-support-guide-wrapper">
					<div className="agent-manager-support-guide-content help-center__container-content">
						<HelpCenterArticle
							sectionName={ sectionName }
							currentSiteDomain={ currentSiteDomain }
							isEligibleForChat={ isEligibleForChat }
							forceEmailSupport={ false }
						/>
					</div>
					{ ! isFromChat && (
						<div className="agent-manager-support-guide-footer">
							<Button variant="primary" onClick={ () => navigate( '/chat' ) }>
								{ __( 'Start a new chat', '__i18n_text_domain__' ) }
							</Button>
						</div>
					) }
				</div>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
