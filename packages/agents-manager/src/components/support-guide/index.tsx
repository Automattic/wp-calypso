import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { HelpCenterArticle } from '@automattic/support-articles';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

interface Props {
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
	/** The current site domain for contextual support. */
	currentSiteDomain?: string;
	/** The current Calypso section name. */
	sectionName: string;
	/** Indicates if the user is eligible for live chat support. */
	isEligibleForChat: boolean;
}

export default function SupportGuide( {
	isOpen,
	chatHeaderOptions,
	isDocked,
	onAbort,
	onClose,
	currentSiteDomain,
	sectionName,
	isEligibleForChat,
}: Props ) {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const isFromChat = !! ( state?.sessionId || state?.conversationId );

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => {} }
			variant={ isDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onStop={ onAbort }
			expandOnHover={ false }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					onBack={ () => {
						// Navigate back to the source route, preserving `state` (`sessionId`/`conversationId`).
						if ( state?.sessionId ) {
							navigate( '/chat', { state } );
						} else {
							navigate( '/zendesk', { state } );
						}
					} }
					options={ chatHeaderOptions }
					title={ __( 'Support Guides', '__i18n_text_domain__' ) }
				/>
				<div className="agent-manager-support-guide-wrapper">
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
							<Button variant="primary" onClick={ () => navigate( '/' ) }>
								{ __( 'Start a new chat', '__i18n_text_domain__' ) }
							</Button>
						</div>
					) }
				</div>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
