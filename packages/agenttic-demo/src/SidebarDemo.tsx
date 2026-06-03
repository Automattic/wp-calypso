import type { ContextProvider } from '@automattic/agenttic-client';
import { useAgentChat } from '@automattic/agenttic-client';
import { getClientContext, getClientTools } from '@automattic/agenttic-client/mocks';

import '../../packages/agenttic-ui/src/markdown-extensions/charts/charts.css';
import {
	AgentUI,
	createMessageRenderer,
	EmptyView,
	ImageUploader,
	type ImageUploaderHandle,
	type UploadedImage,
} from '@automattic/agenttic-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MessageTester from './MessageTester';

const SidebarDemo: React.FC = () => {
	const uploaderRef = useRef<ImageUploaderHandle>( null );
	const [ uploadedImages, setUploadedImages ] = useState<UploadedImage[]>( [] );

	const [ contextProvider ] = useState<ContextProvider>( () => ( {
		getClientContext,
	} ) );

	const addMessageRef = useRef< ( ( message: any ) => void ) | null >( null );

	const toolProvider = useMemo(
		() =>
			getClientTools( ( message ) => {
				if ( addMessageRef.current ) {
					addMessageRef.current( message );
				}
			} ),
		[]
	);

	const {
		messages,
		isProcessing,
		error,
		onSubmit,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		addMessage,
		loadMessages,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-sidebar',
		contextProvider,
		toolProvider,
		enableStreaming: true,
	} );

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	const sampleSuggestions = useMemo(
		() => [
			{ id: '1', label: 'Customize colors', prompt: 'Customize colors' },
			{ id: '2', label: 'Change page layout', prompt: 'Change page layout' },
			{
				id: '3',
				label: 'Change tone to',
				prompt: 'Change the tone of this page to ',
				options: [
					{ id: 'tone-formal', label: 'Formal', value: 'formal' },
					{ id: 'tone-casual', label: 'Casual', value: 'casual' },
					{ id: 'tone-friendly', label: 'Friendly', value: 'friendly' },
					{ id: 'tone-funny', label: 'Funny', value: 'funny' },
				],
			},
			{ id: '5', label: 'What else can you do?', prompt: 'What else can you do?' },
		],
		[]
	);

	useEffect( () => {
		registerSuggestions( sampleSuggestions );
	}, [ registerSuggestions, sampleSuggestions ] );

	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				extensions: {
					charts: { enabled: true },
					gfm: { enabled: true },
				},
				enableStreaming: true,
			} ),
		[]
	);

	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	const handleFilesSelected = useCallback( ( files: File[] ) => {
		// Simulate upload by creating object URLs
		const newImages: UploadedImage[] = files.map( ( file, index ) => ( {
			id: `${ Date.now() }-${ index }`,
			url: URL.createObjectURL( file ),
			name: file.name,
			mime_type: file.type,
		} ) );
		setUploadedImages( ( prev ) => [ ...prev, ...newImages ] );
	}, [] );

	const handleRemoveImage = useCallback( ( image: UploadedImage ) => {
		setUploadedImages( ( prev ) => prev.filter( ( img ) => img.id !== image.id ) );
		// Revoke the object URL to free memory
		URL.revokeObjectURL( image.url );
	}, [] );

	return (
		<>
			<style>
				{ `
				#root {
					display: flow-root;
				}

				body {
					margin: 0;
				}

				.sidebar-demo {
					display: flex;
					height: calc(100vh - 30px);
					background-color: #1e1e1e;
					margin-top: 30px;
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
					color: #c3c4c7;
					border-radius: 4px;
				}

				.sidebar-demo__header-button:hover {
					color: #fff;
					background: rgba(255, 255, 255, 0.08);
				}

				.sidebar-demo__chat {
					flex: 1;
					min-height: 0;
				}
				` }
			</style>
			<div
				style={ {
					position: 'fixed',
					top: '0',
					right: '0',
					display: 'flex',
					flexWrap: 'wrap',
					gap: '2px',
					zIndex: 10000,
				} }
			>
				<MessageTester addMessage={ addMessage } onClear={ () => loadMessages( [] ) } />
			</div>
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
							className="agenttic dark"
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
									<button className="sidebar-demo__header-button" title="More options">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
											<circle cx="12" cy="5" r="2" />
											<circle cx="12" cy="12" r="2" />
											<circle cx="12" cy="19" r="2" />
										</svg>
									</button>
									<button className="sidebar-demo__header-button" title="History">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
									</button>
									<button className="sidebar-demo__header-button" title="Close">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
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
										acceptedFileTypes={ [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp' ] }
										showFileMetadata={ true }
									/>
									<AgentUI.Input imageUploaderRef={ uploaderRef } />
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
