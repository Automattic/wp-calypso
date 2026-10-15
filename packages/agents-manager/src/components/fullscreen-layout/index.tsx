import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close, menu } from '@wordpress/icons';
import clsx from 'clsx';
import { useNavigationType } from 'react-router-dom';
import { useFullscreenNavigation } from '../../hooks/use-fullscreen-navigation';
import { isEditorPage } from '../../utils/is-editor-page';
import lazyComponent from '../../utils/lazy-component';
import { AgentChatRoutes } from '../agent-chat-routes';
import AgentHistory from '../agent-history';
import OrchestratorChat from '../orchestrator-chat';
import SupportGuide from '../support-guide';
import ZendeskChat from '../zendesk-chat';
import { FullscreenLink } from './fullscreen-link';
import { FullscreenSidebar } from './sidebar';
import type AgentDock from '../agent-dock';
import type { ComponentProps } from 'react';
import './style.scss';

const PageDesignRenderer = lazyComponent(
	() => import( /* webpackChunkName: "am-page-design-renderer" */ '../page-design-renderer' )
);

export default function FullscreenLayout( {
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
	...providerProps
}: ComponentProps< typeof AgentDock > ) {
	const {
		abort,
		exitFullscreen,
		startNewChat,
		selectConversation,
		isChatInputDisabled,
		onHasMessagesChange,
		...chatProps
	} = useFullscreenNavigation();
	const [ isSidebarOpen, setIsSidebarOpen ] = useState( false );
	const navigationType = useNavigationType();
	const commonProps = { ...chatProps, isDocked: false, isOpen: true, isFullscreen: true };
	const fullscreenMarkdownComponents = { ...markdownComponents, a: FullscreenLink };
	const handleSelectConversation = (
		conversation: Parameters< typeof selectConversation >[ 0 ]
	) => {
		selectConversation( conversation );
		setIsSidebarOpen( false );
	};
	const handleStartNewChat = () => {
		startNewChat();
		setIsSidebarOpen( false );
	};

	return (
		<section
			className="agents-manager-fullscreen"
			aria-label={ __( 'AI chat', __i18n_text_domain__ ) }
		>
			{ isEditorPage() && <PageDesignRenderer /> }
			<header className="agents-manager-fullscreen__top-bar">
				<Button
					className="agents-manager-fullscreen__sidebar-toggle"
					aria-expanded={ isSidebarOpen }
					aria-controls="agents-manager-fullscreen-sidebar"
					icon={ isSidebarOpen ? close : menu }
					label={
						isSidebarOpen
							? __( 'Close chat history', __i18n_text_domain__ )
							: __( 'Open chat history', __i18n_text_domain__ )
					}
					onClick={ () => setIsSidebarOpen( ( isOpen ) => ! isOpen ) }
				/>
			</header>
			<div
				id="agents-manager-fullscreen-sidebar"
				className={ clsx( 'agents-manager-fullscreen__sidebar-panel', {
					'agents-manager-fullscreen__sidebar-panel--open': isSidebarOpen,
				} ) }
			>
				<FullscreenSidebar
					exitFullscreen={ exitFullscreen }
					startNewChat={ handleStartNewChat }
					selectConversation={ handleSelectConversation }
				/>
			</div>
			{ isSidebarOpen && (
				<button
					type="button"
					className="agents-manager-fullscreen__backdrop"
					aria-label={ __( 'Close chat history', __i18n_text_domain__ ) }
					onClick={ () => setIsSidebarOpen( false ) }
				/>
			) }
			<main className="agents-manager-fullscreen__chat">
				<AgentChatRoutes
					isReaderChat={ false }
					navigationType={ navigationType }
					chat={
						<OrchestratorChat
							{ ...providerProps }
							{ ...commonProps }
							emptyViewSuggestions={ emptyViewSuggestions }
							markdownComponents={ fullscreenMarkdownComponents }
							markdownExtensions={ markdownExtensions }
							suggestionsVisible
							isCompactMode={ false }
							isChatInputDisabled={ isChatInputDisabled }
							onHasMessagesChange={ onHasMessagesChange }
						/>
					}
					zendesk={
						<ZendeskChat
							{ ...commonProps }
							markdownComponents={ fullscreenMarkdownComponents }
							markdownExtensions={ markdownExtensions }
						/>
					}
					supportGuide={ <SupportGuide { ...commonProps } onAbort={ abort } /> }
					history={
						<AgentHistory
							{ ...commonProps }
							onAbort={ abort }
							onSelectConversation={ selectConversation }
						/>
					}
				/>
			</main>
		</section>
	);
}
