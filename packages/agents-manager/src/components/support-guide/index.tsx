import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { HelpCenterArticle } from '@automattic/support-articles';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

interface SupportGuideProps {
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
}

export default function SupportGuide( {
	isOpen,
	chatHeaderOptions,
	isDocked,
	onAbort,
	onClose,
	onExpand,
}: SupportGuideProps ) {
	const { site, sectionName, isEligibleForChat } = useAgentsManagerContext();
	const navigate = useNavigate();
	const { state } = useLocation();
	const { setFloatingPosition, setFreeDragPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	// Without the AI chat entry button, use `collapsed` (a FAB) instead of `minimized`.
	const closedChatState = useHasAiChatEntryButton() ? 'minimized' : 'collapsed';
	const isFromChat = !! ( state?.sessionId || state?.conversationId );
	const title = __( 'Support Guides', __i18n_text_domain__ );

	// Navigate back to the source route, preserving relevant state.
	const handleBack = () => {
		if ( state?.sessionId ) {
			navigate( '/chat', { state } );
		} else if ( state?.conversationId ) {
			navigate( '/zendesk', { state } );
		} else {
			navigate( '/support-guides', { state } );
		}
	};

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			initialFreeDragPosition={ freeDragPosition ?? undefined }
			onFreeDragEnd={ setFreeDragPosition }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => {} }
			variant={ isDocked ? 'embedded' : 'floating' }
			freeDrag={ ! isDocked }
			floatingChatState={ isOpen ? 'expanded' : closedChatState }
			triggerTitle={ title }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			expandOnHover={ false }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					onBack={ handleBack }
					options={ chatHeaderOptions }
					title={ title }
					isDocked={ isDocked }
				/>
				<div className="agent-manager-support-guide-wrapper">
					<div className="agent-manager-support-guide-content help-center__container-content">
						<HelpCenterArticle
							sectionName={ sectionName }
							currentSiteDomain={ site?.domain }
							isEligibleForChat={ isEligibleForChat }
							forceEmailSupport={ false }
						/>
					</div>
					{ ! isFromChat && (
						<div className="agent-manager-support-guide-footer">
							<Button variant="primary" onClick={ () => navigate( '/' ) }>
								{ __( 'Start a new chat', __i18n_text_domain__ ) }
							</Button>
						</div>
					) }
				</div>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
