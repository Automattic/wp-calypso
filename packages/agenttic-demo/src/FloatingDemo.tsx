import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { UIMessage } from '@automattic/agenttic-client';
import { AgentUI, CopyIcon, EmptyView } from '@automattic/agenttic-ui';
import type { ChatState } from '@automattic/agenttic-ui';

import MessageTester from './MessageTester';
import {
	ToolButton,
	usePlaygroundHeaderHeight,
	ViewTools,
} from './playground/PlaygroundShell';
import { SuggestionsTool } from './playground/SuggestionsTool';
import { useDemoChat } from './hooks/useDemoChat';
import { useDemoFeedback } from './hooks/useDemoFeedback';

const FloatingDemo: React.FC< {
	currentTheme: 'light' | 'dark';
	floatingChatState?: ChatState;
	triggerTitle?: string;
} > = ( { currentTheme, floatingChatState, triggerTitle } ) => {
	const headerHeight = usePlaygroundHeaderHeight();

	// Custom markdown components for demo
	const customMarkdownComponents = useMemo(
		() => ( {
			// Custom blockquote with left border and styling
			blockquote: ( { children, ...props }: any ) => (
				<blockquote
					{ ...props }
					style={ {
						borderLeft: '4px solid #007cba',
						backgroundColor: '#f0f8ff',
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
		[]
	);

	const {
		messages,
		isProcessing,
		error,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		registerMessageActions,
		addMessage,
		loadMessages,
		abortCurrentRequest,
		messageRenderer,
		handleSubmit,
	} = useDemoChat( {
		sessionId: 'dev-session-floating',
		markdownComponents: customMarkdownComponents,
	} );

	const [ freeDragEnabled, setFreeDragEnabled ] = useState( false );
	const [ freeDragPosition, setFreeDragPosition ] = useState<
		{ x: number; y: number } | undefined
	>( undefined );
	const RESIZABLE_MODES: Array< boolean | 'horizontal' | 'vertical' > = [
		false,
		true,
		'horizontal',
		'vertical',
	];
	const [ resizableMode, setResizableMode ] = useState<
		boolean | 'horizontal' | 'vertical'
	>( false );
	const RESIZABLE_LABELS = new Map<
		boolean | 'horizontal' | 'vertical',
		string
	>( [
		[ false, 'OFF' ],
		[ true, 'BOTH' ],
		[ 'horizontal', 'HORIZONTAL' ],
		[ 'vertical', 'VERTICAL' ],
	] );
	const resizableLabel = RESIZABLE_LABELS.get( resizableMode );
	const [ chatSize, setChatSize ] = useState<
		{ width: number; height: number } | undefined
	>( undefined );

	const defaultSuggestions = useMemo(
		() => [
			{
				id: '1',
				label: 'Edit link',
				prompt: 'Change the button link to:',
				options: [
					{ id: 'color-blue', label: 'Blue', value: 'blue' },
					{ id: 'color-red', label: 'Red', value: 'red' },
					{ id: 'color-green', label: 'Green', value: 'green' },
				],
			},
			{ id: '2', label: 'Remove button', prompt: 'Remove this button' },
			{
				id: '3',
				label: 'Change color',
				prompt: 'Change the button color to ',
				options: [
					{ id: 'color-blue', label: 'Blue', value: 'blue' },
					{ id: 'color-red', label: 'Red', value: 'red' },
					{ id: 'color-green', label: 'Green', value: 'green' },
				],
			},
		],
		[]
	);

	// Register the default suggestions on mount
	useEffect( () => {
		registerSuggestions( defaultSuggestions );
	}, [ registerSuggestions, defaultSuggestions ] );

	const handleCopy = useCallback( async ( message: UIMessage ) => {
		const textContent = message.content
			.filter( ( item ) => item.type === 'text' )
			.map( ( item ) => item.text )
			.join( '\n' );

		try {
			// @ts-ignore - navigator is available in browser
			await navigator.clipboard.writeText( textContent );
			console.log( 'Message copied to clipboard' );
		} catch ( err ) {
			console.error( 'Failed to copy message:', err );
		}
	}, [] );

	useDemoFeedback( registerMessageActions );

	useEffect( () => {
		registerMessageActions( {
			id: 'demo-copy',
			actions: [
				{
					id: 'copy',
					label: 'Copy message',
					icon: <CopyIcon />,
					onClick: handleCopy,
					condition: ( message: UIMessage ) =>
						message.role === 'agent',
					tooltip: 'Copy message content',
				},
			],
		} );
	}, [ registerMessageActions, handleCopy ] );

	return (
		<div
			// Inline styles are used here to demonstrate how to  theme colors.
			style={ {
				height: '100%',
				backgroundColor: '#eee',
			} }
		>
			<ViewTools>
				<SuggestionsTool
					defaultSuggestions={ defaultSuggestions }
					registerSuggestions={ registerSuggestions }
				/>
				<ToolButton
					active={ freeDragEnabled }
					onClick={ () => setFreeDragEnabled( ( prev ) => ! prev ) }
				>
					Free Drag: { freeDragEnabled ? 'ON' : 'OFF' }
				</ToolButton>
				<ToolButton
					active={ !! resizableMode }
					onClick={ () =>
						setResizableMode( ( prev ) => {
							const next =
								( RESIZABLE_MODES.indexOf( prev ) + 1 ) %
								RESIZABLE_MODES.length;
							return RESIZABLE_MODES[ next ];
						} )
					}
				>
					Resizable: { resizableLabel }
				</ToolButton>
				{ /* Controlled-size exerciser: grows the controlled `size` in
					   steps so the panel animates; drag stays in sync via
					   onResizeEnd feeding the same state. */ }
				{ resizableMode && (
					<ToolButton
						onClick={ () =>
							setChatSize( ( prev ) => {
								const base = prev ?? {
									width: 372,
									height: 520,
								};
								return {
									width: base.width + 80,
									height: base.height + 80,
								};
							} )
						}
					>
						Grow (controlled)
					</ToolButton>
				) }
				{ /* Live size readout for verifying resize clamping */ }
				{ resizableMode && chatSize && (
					<span className="playground-status">
						{ Math.round( chatSize.width ) } ×{ ' ' }
						{ Math.round( chatSize.height ) }
					</span>
				) }
				<MessageTester
					addMessage={ addMessage }
					loadMessages={ loadMessages }
					onClear={ () => loadMessages( [] ) }
				/>
			</ViewTools>
			<AgentUI
				className={ `agenttic ${ currentTheme }` }
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				onStop={ abortCurrentRequest }
				variant="floating"
				floatingChatState={ floatingChatState }
				triggerTitle={ triggerTitle }
				boundaryInset={ { top: headerHeight + 16 } }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				expandOnClick={ false }
				locale="en"
				messagesPosition="bottom"
				emptyView={ <EmptyView suggestions={ suggestions } /> }
				freeDrag={ freeDragEnabled }
				initialFreeDragPosition={ freeDragPosition }
				onFreeDragEnd={ setFreeDragPosition }
				resizable={ resizableMode }
				defaultSize={ { width: 372, height: 520 } }
				size={ chatSize }
				onResize={ setChatSize }
				onResizeEnd={ setChatSize }
				onSuggestionsRendered={ ( shown ) => console.log( shown ) }
			/>
		</div>
	);
};

export default FloatingDemo;
