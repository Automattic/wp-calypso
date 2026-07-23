import {
	AgentUI,
	EmptyView,
	ImageUploader,
	type ImageUploaderHandle,
} from '@automattic/agenttic-ui';
import React, { useEffect, useMemo, useRef } from 'react';
import MessageTester from './MessageTester';
import { ViewTools } from './playground/PlaygroundShell';
import { SuggestionsTool } from './playground/SuggestionsTool';
import { useDemoChat } from './hooks/useDemoChat';
import { useImageUploads } from './hooks/useImageUploads';

const SidebarDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( {
	currentTheme,
} ) => {
	const uploaderRef = useRef< ImageUploaderHandle >( null );
	const { uploadedImages, handleFilesSelected, handleRemoveImage } =
		useImageUploads();

	const {
		messages,
		isProcessing,
		error,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		addMessage,
		loadMessages,
		abortCurrentRequest,
		messageRenderer,
		handleSubmit,
	} = useDemoChat( {
		sessionId: 'dev-session-sidebar',
		enableStreaming: true,
	} );

	const sampleSuggestions = useMemo(
		() => [
			{ id: '1', label: 'Customize colors', prompt: 'Customize colors' },
			{
				id: '2',
				label: 'Change page layout',
				prompt: 'Change page layout',
			},
			{
				id: '3',
				label: 'Change tone to',
				prompt: 'Change the tone of this page to ',
				options: [
					{ id: 'tone-formal', label: 'Formal', value: 'formal' },
					{ id: 'tone-casual', label: 'Casual', value: 'casual' },
					{
						id: 'tone-friendly',
						label: 'Friendly',
						value: 'friendly',
					},
					{ id: 'tone-funny', label: 'Funny', value: 'funny' },
				],
			},
			{
				id: '5',
				label: 'What else can you do?',
				prompt: 'What else can you do?',
			},
		],
		[]
	);

	useEffect( () => {
		registerSuggestions( sampleSuggestions );
	}, [ registerSuggestions, sampleSuggestions ] );

	return (
		<>
			<style>
				{ `
				.sidebar-demo {
					display: flex;
					height: 100%;
					background-color: ${ currentTheme === 'dark' ? '#1e1e1e' : '#f0f0f1' };
				}

				.sidebar-demo__content {
					flex: 1;
					margin: 16px;
					margin-right: 0;
					background: #787c82;
					border-radius: 8px;
				}

				.sidebar-demo__sidebar {
					width: 350px;
					min-width: 350px;
					height: 100%;
					display: flex;
					flex-direction: column;
					padding: 16px;
				}

				.sidebar-demo__header {
					display: flex;
					align-items: center;
					justify-content: flex-end;
					gap: 4px;
				}

				.sidebar-demo__header-button {
					all: unset;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 32px;
					height: 32px;
					cursor: pointer;
					color: ${ currentTheme === 'dark' ? '#c3c4c7' : '#50575e' };
					border-radius: 4px;
				}

				.sidebar-demo__header-button:hover {
					color: ${ currentTheme === 'dark' ? '#fff' : '#1e1e1e' };
					background: ${
						currentTheme === 'dark'
							? 'rgba(255, 255, 255, 0.08)'
							: 'rgba(0, 0, 0, 0.06)'
					};
				}

				.sidebar-demo__chat {
					flex: 1;
					min-height: 0;
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
			</ViewTools>
			<div className="sidebar-demo">
				<div className="sidebar-demo__content" />
				<div className="sidebar-demo__sidebar">
					<div className="sidebar-demo__chat">
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
							messagesPosition="bottom"
							className={ `agenttic ${ currentTheme }` }
							placeholder="Ask anything..."
							emptyView={
								<EmptyView
									heading="Howdy! How can I help you today?"
									help="Got a different request? Ask away."
									suggestions={ suggestions }
								/>
							}
						>
							<AgentUI.ConversationView>
								<div className="sidebar-demo__header">
									<button
										className="sidebar-demo__header-button"
										title="More options"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<circle cx="12" cy="5" r="2" />
											<circle cx="12" cy="12" r="2" />
											<circle cx="12" cy="19" r="2" />
										</svg>
									</button>
									<button
										className="sidebar-demo__header-button"
										title="History"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</button>
									<button
										className="sidebar-demo__header-button"
										title="Close"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line
												x1="18"
												y1="6"
												x2="6"
												y2="18"
											/>
											<line
												x1="6"
												y1="6"
												x2="18"
												y2="18"
											/>
										</svg>
									</button>
								</div>
								<AgentUI.Messages />
								<AgentUI.Footer>
									<AgentUI.Notice />
									<ImageUploader
										ref={ uploaderRef }
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
									<AgentUI.Input
										imageUploaderRef={ uploaderRef }
									/>
								</AgentUI.Footer>
							</AgentUI.ConversationView>
						</AgentUI.Container>
					</div>
				</div>
			</div>
		</>
	);
};

export default SidebarDemo;
