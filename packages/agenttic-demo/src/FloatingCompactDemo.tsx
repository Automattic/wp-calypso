import {
	AgentUI,
	EmptyView,
	ProgressRing,
	ZoomIcon,
	ZoomIconFilled,
} from '@automattic/agenttic-ui';
import React, { useEffect, useState } from 'react';
import MessageTester from './MessageTester';
import { useDemoChat } from './hooks/useDemoChat';
import { useDemoCredits } from './hooks/useDemoCredits';
import { useDemoFeedback } from './hooks/useDemoFeedback';
import { CreditsTool } from './playground/CreditsTool';
import { ToolButton, usePlaygroundHeaderHeight, ViewTools } from './playground/PlaygroundShell';
import { SuggestionsTool } from './playground/SuggestionsTool';
import type { UIMessage } from '@automattic/agenttic-client';

const FloatingCompactDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( {
	currentTheme,
} ) => {
	const headerHeight = usePlaygroundHeaderHeight();
	const [ isZoomed, setIsZoomed ] = useState( false );
	const [ freeDragEnabled, setFreeDragEnabled ] = useState( false );
	// Persist the dropped free-drag position so it survives remounts (Remount button below).
	const [ freeDragPosition, setFreeDragPosition ] = useState<
		{ x: number; y: number } | undefined
	>( undefined );
	const [ remountKey, setRemountKey ] = useState( 0 );
	const demoCredits = useDemoCredits();

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
		sessionId: 'dev-session-floating-compact',
		onTaskUpdate: demoCredits.onTaskUpdate,
	} );

	useDemoFeedback( registerMessageActions );

	// Register zoom action with `order: 1` so it appears before feedback actions.
	useEffect( () => {
		const zoomAction = {
			id: 'zoom-toggle',
			label: isZoomed ? '50%' : '100%',
			showLabel: true,
			icon: isZoomed ? <ZoomIconFilled /> : <ZoomIcon />,
			onClick: () => {
				setIsZoomed( ! isZoomed );
				console.log( 'Zoom toggled:', ! isZoomed );
			},
			condition: ( message: UIMessage ) => message.role === 'agent',
			tooltip: isZoomed ? 'Zoom to 100%' : 'Zoom to 50%',
			pressed: isZoomed,
			order: 1,
		};

		registerMessageActions( {
			id: 'demo-zoom',
			actions: [ zoomAction ],
		} );
	}, [ isZoomed, registerMessageActions ] );

	return (
		<div
			// Inline styles are used here to demonstrate how to  theme colors.
			style={ {
				height: '100%',
				backgroundColor: '#eee',
			} }
		>
			<ViewTools>
				<CreditsTool
					plan={ demoCredits.plan }
					percent={ demoCredits.percent }
					onPlanChange={ demoCredits.changePlan }
					onPercentChange={ demoCredits.changePercent }
				/>
				<SuggestionsTool registerSuggestions={ registerSuggestions } />
				<ToolButton
					active={ freeDragEnabled }
					onClick={ () => setFreeDragEnabled( ( prev ) => ! prev ) }
				>
					Free Drag: { freeDragEnabled ? 'ON' : 'OFF' }
				</ToolButton>
				<ToolButton onClick={ () => setRemountKey( ( prev ) => prev + 1 ) }>Remount</ToolButton>
				<MessageTester
					addMessage={ addMessage }
					loadMessages={ loadMessages }
					onClear={ () => loadMessages( [] ) }
				/>
			</ViewTools>
			<AgentUI
				key={ remountKey }
				className={ `agenttic ${ currentTheme }` }
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				onStop={ abortCurrentRequest }
				variant="floating"
				initialChatPosition="left"
				floatingChatState="compact"
				boundaryInset={ { top: headerHeight + 16 } }
				draggableStates={ [ 'collapsed', 'compact', 'expanded' ] }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				messagesPosition="bottom"
				expandOnClick={ false }
				notice={
					demoCredits.plan !== 'none'
						? demoCredits.notice
						: {
								message: 'Upgrade now to launch.',
								action: {
									label: 'Subscribe',
									onClick: () => {
										console.log( 'Subscribe' );
									},
								},
							}
				}
				beforeSubmit={ demoCredits.beforeSubmit }
				trailingActions={
					demoCredits.plan !== 'none' && (
						<span
							role="img"
							className="demo-credits-ring"
							aria-label={ demoCredits.label }
							title={ demoCredits.label }
						>
							<ProgressRing percent={ demoCredits.percent } tone={ demoCredits.tone } />
						</span>
					)
				}
				emptyView={ <EmptyView suggestions={ suggestions } /> }
				freeDrag={ freeDragEnabled }
				initialFreeDragPosition={ freeDragPosition }
				onFreeDragEnd={ setFreeDragPosition }
			/>
		</div>
	);
};

export default FloatingCompactDemo;
