import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { UIMessage } from '@automattic/agenttic-client';
import {
	AgentUI,
	EmptyView,
	ImageUploader,
	RegenerateAltIcon,
} from '@automattic/agenttic-ui';

import DemoMoreMenu from './DemoMoreMenu';
import MessageTester from './MessageTester';
import { ToolButton, ViewTools } from './playground/PlaygroundShell';
import { SuggestionsTool } from './playground/SuggestionsTool';
import { useDemoChat } from './hooks/useDemoChat';
import { useDemoFeedback } from './hooks/useDemoFeedback';
import { useImageUploads } from './hooks/useImageUploads';

const EmbeddedDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( {
	currentTheme,
} ) => {
	const [ manualThinkingMessage, setManualThinkingMessage ] = useState<
		string | undefined
	>();

	const [ isTyping, setIsTyping ] = useState( false );

	// Custom markdown components for demo
	const customMarkdownComponents = useMemo(
		() => ( {
			// Custom blockquote with left border and styling
			blockquote: ( { children, ...props }: any ) => (
				<blockquote
					{ ...props }
					style={ {
						borderLeft: '4px solid #007cba',
						backgroundColor:
							currentTheme === 'dark' ? '#0d375c' : '#f0f8ff',
						margin: '16px 0',
						padding: '12px 16px',
						fontStyle: 'italic',
						borderRadius: '0 4px 4px 0',
					} }
				>
					{ children }
				</blockquote>
			),
		} ),
		[ currentTheme ]
	);

	const {
		messages,
		isProcessing,
		error,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		registerMessageActions,
		getRegenerateHandler,
		addMessage,
		loadMessages,
		abortCurrentRequest,
		messageRenderer,
		handleSubmit,
	} = useDemoChat( {
		sessionId: 'dev-session-embedded',
		enableStreaming: true,
		markdownComponents: customMarkdownComponents,
	} );

	// Sample suggestions for embedded demo
	const sampleSuggestions = useMemo(
		() => [
			{
				id: '1',
				label: 'Create a blog post',
				prompt: 'Help me create a blog post about web development',
			},
			{
				id: '2',
				label: 'Design tips',
				prompt: 'Give me some design tips for my website',
			},
			{
				id: '3',
				label: 'SEO advice',
				prompt: 'How can I improve my website SEO?',
			},
		],
		[]
	);

	// Register suggestions on mount
	useEffect( () => {
		registerSuggestions( sampleSuggestions );
	}, [ registerSuggestions, sampleSuggestions ] );

	useDemoFeedback( registerMessageActions );

	// Register a demo "more menu" component action on agent messages.
	// Uses `order` to control position — lower values appear first.
	// Feedback actions have no `order` so they appear at the end.
	useEffect( () => {
		registerMessageActions( {
			id: 'demo-more-menu',
			actions: ( message: UIMessage ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}
				return [
					{
						type: 'component' as const,
						id: 'more-menu',
						component: DemoMoreMenu,
						order: 1,
					},
				];
			},
		} );
	}, [ registerMessageActions ] );

	useEffect( () => {
		registerMessageActions( {
			id: 'demo-regenerate',
			actions: ( message: UIMessage ) => {
				const onRegenerate = getRegenerateHandler( message );

				return onRegenerate
					? [
							{
								id: 'regenerate',
								label: 'Regenerate',
								tooltip: 'Regenerate response',
								icon: <RegenerateAltIcon />,
								order: 2,
								onClick: onRegenerate,
							},
					  ]
					: [];
			},
		} );
	}, [ getRegenerateHandler, registerMessageActions ] );

	const handleSuggestionSelect = useCallback( ( message: string ) => {
		console.log( 'Selected suggestion:', message );
	}, [] );

	const { uploadedImages, handleFilesSelected, handleRemoveImage } =
		useImageUploads();

	return (
		<>
			<style>
				{ `
                body {
                    background-color: ${
						currentTheme === 'dark' ? '#1F1F1F' : '#FCFCFC'
					};
                }

                /* Override suggestions positioning to appear below footer */
                .embedded-demo .agenttic [data-slot="conversation-view"] > div:last-child {
                    position: static !important;
                    transform: none !important;
                    margin-top: var(--spacing-2);
                    padding: var(--spacing-2);
                }
                ` }
			</style>
			<ViewTools>
				<SuggestionsTool
					defaultSuggestions={ sampleSuggestions }
					registerSuggestions={ registerSuggestions }
				/>
				<MessageTester
					addMessage={ addMessage }
					loadMessages={ loadMessages }
					onClear={ () => loadMessages( [] ) }
				/>
				<ToolButton
					accent
					onClick={ () => {
						setManualThinkingMessage(
							'Testing progress message...'
						);
						setTimeout(
							() => setManualThinkingMessage( undefined ),
							3000
						);
					} }
				>
					Test Progress
				</ToolButton>
				<span className="playground-status">
					{ isTyping ? '✍️ Typing…' : '💤 Not typing' }
				</span>
			</ViewTools>
			<div
				className="embedded-demo"
				style={ {
					height: '100%',
					boxSizing: 'border-box',
					padding: '1.5rem',
					maxWidth: '660px',
					margin: '0 auto',
				} }
			>
				<AgentUI.Container
					messages={ messages }
					isProcessing={ isProcessing }
					error={ error }
					onSubmit={ handleSubmit }
					onStop={ abortCurrentRequest }
					variant="embedded"
					suggestions={ suggestions }
					clearSuggestions={ clearSuggestions }
					messageRenderer={ messageRenderer }
					className={ `agenttic ${ currentTheme }` }
					placeholder={ [
						'Ask me anything',
						'How can I help you today?',
						'What would you like to create?',
						'Need help with your website?',
						"Let's build something amazing",
					] }
					emptyView={ <EmptyView suggestions={ suggestions } /> }
					thinkingMessage={ manualThinkingMessage }
					onTypingStatusChange={ setIsTyping }
				>
					<AgentUI.ConversationView showHeader={ false }>
						<AgentUI.Messages />
						<AgentUI.Footer>
							<AgentUI.Notice />
							<ImageUploader
								images={ uploadedImages }
								onFilesSelected={ handleFilesSelected }
								onRemoveImage={ handleRemoveImage }
								acceptedFileTypes={ [
									'image/jpeg',
									'image/png',
									'image/gif',
									'image/webp',
								] }
								showFileMetadata={ true }
							/>
							<AgentUI.Input />
							<AgentUI.InputToolbar label="Custom Toolbar">
								<div>
									<p>This is a custom input toolbar.</p>
								</div>
							</AgentUI.InputToolbar>
						</AgentUI.Footer>
						<AgentUI.Suggestions
							onSelect={ handleSuggestionSelect }
						/>
					</AgentUI.ConversationView>
				</AgentUI.Container>
			</div>
		</>
	);
};

export default EmbeddedDemo;
