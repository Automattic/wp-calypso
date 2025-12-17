import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { HelpCenterArticle } from '@automattic/support-articles';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
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
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	function handleSubmit( value: string ) {
		// eslint-disable-next-line no-console
		console.log( 'Submitted message:', value );
	}

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
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
