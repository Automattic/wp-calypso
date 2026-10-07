import { AgentUI, AgentUIChecklist, type ChecklistItem } from '@automattic/agenttic-ui';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import MessageTester from './MessageTester';
import { buildChecklist, type ChecklistPreset, LAUNCH_CHECKLIST_TITLE } from './data/checklistSets';
import { useDemoChat } from './hooks/useDemoChat';
import { ChecklistTool } from './playground/ChecklistTool';
import { ViewTools } from './playground/PlaygroundShell';

interface LaunchpadState {
	items: ChecklistItem[];
	pinned: boolean;
	collapsed: boolean;
	setCollapsed: ( collapsed: boolean ) => void;
	select: ( id: string ) => void;
}

// The checklist message is added once; its component reads live state from
// here so preset changes and clicks update it in place.
const LaunchpadContext = createContext< LaunchpadState | null >( null );

function LaunchpadChecklist( { state }: { state: LaunchpadState } ) {
	return (
		<AgentUIChecklist
			title={ LAUNCH_CHECKLIST_TITLE }
			items={ state.items }
			collapsed={ state.collapsed }
			onCollapsedChange={ state.setCollapsed }
			onSelect={ ( item ) => state.select( item.id ) }
		/>
	);
}

// Lives in the conversation until the first selection; after that the list is
// pinned above the messages and this message renders empty (the chat hook has
// no way to remove a message).
function DemoChecklistMessage() {
	const state = useContext( LaunchpadContext );
	if ( ! state || state.pinned ) {
		return null;
	}
	return <LaunchpadChecklist state={ state } />;
}

const CHECKLIST_MESSAGE_ID = 'launchpad-checklist';

const createChecklistMessage = () => ( {
	id: CHECKLIST_MESSAGE_ID,
	role: 'agent' as const,
	content: [ { type: 'component' as const, component: DemoChecklistMessage } ],
	timestamp: Date.now(),
	archived: false,
	showIcon: false,
} );

const LaunchpadDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( { currentTheme } ) => {
	const [ preset, setPreset ] = useState< ChecklistPreset >( 'fresh' );
	const [ items, setItems ] = useState< ChecklistItem[] >( () => buildChecklist( 'fresh' ) );
	const [ pinned, setPinned ] = useState( false );
	const [ collapsed, setCollapsed ] = useState( false );

	const {
		messages,
		isProcessing,
		error,
		suggestions,
		clearSuggestions,
		addMessage,
		loadMessages,
		abortCurrentRequest,
		messageRenderer,
		handleSubmit,
	} = useDemoChat( {
		sessionId: 'dev-session-launchpad',
		enableStreaming: true,
	} );

	// Re-seeded whenever it is missing: the chat hook replaces its message list
	// during session setup, and a reset empties it. Seeding is keyed on the
	// list reference so StrictMode's double effect doesn't add it twice.
	const seededForRef = useRef< unknown >( null );
	useEffect( () => {
		const hasChecklist = messages.some( ( message ) => message.id === CHECKLIST_MESSAGE_ID );
		if ( ! hasChecklist && seededForRef.current !== messages ) {
			seededForRef.current = messages;
			addMessage( createChecklistMessage() );
		}
	}, [ messages, addMessage ] );

	const resetChat = useCallback( () => {
		setPinned( false );
		setCollapsed( false );
		return loadMessages( [] );
	}, [ loadMessages ] );

	const changePreset = ( next: ChecklistPreset ) => {
		setPreset( next );
		setItems( buildChecklist( next ) );
		setPinned( false );
		setCollapsed( false );
	};

	// First selection moves the list out of the conversation and pins it. That
	// swaps checklist instances, so the focus the component put on its header
	// has to be carried over to the pinned one.
	const pinnedRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		if ( pinned ) {
			pinnedRef.current?.querySelector< HTMLButtonElement >( 'button[aria-expanded]' )?.focus();
		}
	}, [ pinned ] );

	const select = useCallback( ( id: string ) => {
		setItems( ( current ) =>
			current.map( ( item ) => ( item.id === id ? { ...item, status: 'in_progress' } : item ) )
		);
		setPinned( true );
	}, [] );

	// Finishing a task reopens the list, as the prototype does.
	const completeInProgress = () => {
		setItems( ( current ) =>
			current.map( ( item ) =>
				item.status === 'in_progress' ? { ...item, status: 'done' } : item
			)
		);
		setCollapsed( false );
	};

	const state: LaunchpadState = { items, pinned, collapsed, setCollapsed, select };

	return (
		<LaunchpadContext.Provider value={ state }>
			<style>
				{ `
				.launchpad-demo {
					display: flex;
					height: 100%;
					background-color: ${ currentTheme === 'dark' ? '#1e1e1e' : '#f0f0f1' };
				}

				.launchpad-demo__content {
					flex: 1;
					margin: 16px;
					margin-right: 0;
					background: #787c82;
					border-radius: 8px;
				}

				.launchpad-demo__sidebar {
					width: 350px;
					min-width: 350px;
					height: 100%;
					display: flex;
					flex-direction: column;
					padding: 16px;
				}

				.launchpad-demo__chat {
					flex: 1;
					min-height: 0;
				}

				/* Matches the horizontal inset of the messages below it. */
				.launchpad-demo__pinned {
					padding: 4px 16px 8px;
				}
				` }
			</style>
			<ViewTools>
				<ChecklistTool
					preset={ preset }
					onPresetChange={ changePreset }
					onComplete={ completeInProgress }
					onReset={ resetChat }
				/>
				<MessageTester
					addMessage={ addMessage }
					loadMessages={ loadMessages }
					onClear={ resetChat }
				/>
			</ViewTools>
			<div className="launchpad-demo">
				<div className="launchpad-demo__content" />
				<div className="launchpad-demo__sidebar">
					<div className="launchpad-demo__chat">
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
						>
							<AgentUI.ConversationView>
								{ pinned && (
									<div ref={ pinnedRef } className="launchpad-demo__pinned">
										<LaunchpadChecklist state={ state } />
									</div>
								) }
								<AgentUI.Messages />
								<AgentUI.Footer>
									<AgentUI.Notice />
									<AgentUI.Input />
								</AgentUI.Footer>
							</AgentUI.ConversationView>
						</AgentUI.Container>
					</div>
				</div>
			</div>
		</LaunchpadContext.Provider>
	);
};

export default LaunchpadDemo;
