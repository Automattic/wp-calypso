/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Hoisted mock functions: `jest.resetModules()` re-runs the factories between
// tests, so the assertions must not hold a reference from a stale registry.
const mockRecordTracksEvent = jest.fn();
const mockAddFilter = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: mockRecordTracksEvent,
} ) );

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

const DEFAULT_PLACEHOLDER = 'Type / to choose a block';
const DRAFT_PLACEHOLDER = 'Type /draft to get started with AI';

type DraftEntryModule = typeof import('./draft-entry');

async function loadDraftEntry(): Promise< DraftEntryModule > {
	return import( './draft-entry' );
}

function installFeature(
	features: Record< string, boolean > = { draftAssist: true },
	enabled = true
) {
	( globalThis as any ).agentsManagerData = {
		jetpackAiSidebar: { enabled, features },
	};
}

type EditorStores = {
	settings: { bodyPlaceholder?: string };
	updateSettings: jest.Mock;
	notify: () => void;
	setPostEmpty: ( isEmpty: boolean ) => void;
	setPostType: ( postType: string ) => void;
	listenerCount: () => number;
	subscribe: jest.Mock;
	unsubscribe: jest.Mock;
};

function installEditorStores( {
	postType = 'post',
	isEmpty = true,
	bodyPlaceholder = DEFAULT_PLACEHOLDER,
	withWpData = true,
	getSettingsThrows = false,
	isEditedPostEmptyThrows = false,
}: {
	postType?: string;
	isEmpty?: boolean;
	bodyPlaceholder?: string;
	withWpData?: boolean;
	getSettingsThrows?: boolean;
	isEditedPostEmptyThrows?: boolean;
} = {} ): EditorStores {
	const settings: { bodyPlaceholder?: string } = { bodyPlaceholder };
	let listeners: Array< () => void > = [];
	let postEmpty = isEmpty;
	let currentPostType = postType;

	const updateSettings = jest.fn( ( next: { bodyPlaceholder?: string } ) => {
		Object.assign( settings, next );
	} );
	// Mirrors `wp.data`: the returned function actually detaches the listener, so
	// a leaked subscription shows up as a listener that keeps being called.
	const unsubscribe = jest.fn();
	const subscribe = jest.fn( ( listener: () => void ) => {
		listeners.push( listener );
		return () => {
			unsubscribe();
			listeners = listeners.filter( ( candidate ) => candidate !== listener );
		};
	} );

	if ( withWpData ) {
		( window as any ).wp = {
			data: {
				subscribe,
				select: ( store: string ) => {
					if ( store === 'core/editor' ) {
						return {
							getCurrentPostType: () => currentPostType,
							isEditedPostEmpty: () => {
								if ( isEditedPostEmptyThrows ) {
									throw new Error( 'isEditedPostEmpty exploded' );
								}
								return postEmpty;
							},
						};
					}
					if ( store === 'core/block-editor' ) {
						return {
							getSettings: () => {
								if ( getSettingsThrows ) {
									throw new Error( 'getSettings exploded' );
								}
								return settings;
							},
						};
					}
					return undefined;
				},
				dispatch: ( store: string ) =>
					store === 'core/block-editor' ? { updateSettings } : undefined,
			},
		};
	} else {
		( window as any ).wp = {};
	}

	return {
		settings,
		updateSettings,
		subscribe,
		unsubscribe,
		notify: () => [ ...listeners ].forEach( ( listener ) => listener() ),
		listenerCount: () => listeners.length,
		setPostEmpty: ( value: boolean ) => {
			postEmpty = value;
		},
		setPostType: ( value: string ) => {
			currentPostType = value;
		},
	};
}

function installAgentsManagerActions( {
	isReady = true,
	withSubmit = true,
	submitRejects = false,
}: { isReady?: boolean; withSubmit?: boolean; submitRejects?: boolean } = {} ) {
	const setChatOpen = jest.fn();
	const setChatInput = jest.fn();
	const submitChatMessage = jest.fn( () =>
		submitRejects ? Promise.reject( new Error( 'no' ) ) : Promise.resolve()
	);

	( window as any ).__agentsManagerActions = {
		isReady,
		setChatOpen,
		setChatInput,
		...( withSubmit ? { submitChatMessage } : {} ),
	};

	return { setChatOpen, setChatInput, submitChatMessage };
}

/** Mirrors how Gutenberg filters completer options by the typed query. */
function matchesQuery( completer: any, option: any, query: string ): boolean {
	const keywords = [ ...completer.getOptionKeywords( option ), completer.getOptionLabel( option ) ];
	const search = new RegExp( '(?:\\b|\\s|^)' + query, 'i' );
	return keywords.some( ( keyword: string ) => search.test( keyword ) );
}

function getTracksCalls( eventName: string ) {
	return mockRecordTracksEvent.mock.calls.filter( ( [ name ] ) => name === eventName );
}

describe( 'draft assist entry point', () => {
	beforeEach( () => {
		jest.resetModules();
		jest.clearAllMocks();
		delete ( globalThis as any ).agentsManagerData;
		delete ( window as any ).wp;
		delete ( window as any ).__agentsManagerActions;
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	describe( 'registration', () => {
		it( 'registers the autocompleter filter and swaps the placeholder when enabled', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry, DRAFT_ENTRY_FILTER_NAMESPACE, addDraftCompleter } =
				await loadDraftEntry();

			registerDraftEntry();

			expect( mockAddFilter ).toHaveBeenCalledWith(
				'editor.Autocomplete.completers',
				DRAFT_ENTRY_FILTER_NAMESPACE,
				addDraftCompleter
			);
			expect( stores.updateSettings ).toHaveBeenCalledWith( {
				bodyPlaceholder: DRAFT_PLACEHOLDER,
			} );
		} );

		it( 'registers only once', async () => {
			installFeature();
			installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			registerDraftEntry();
			registerDraftEntry();

			expect( mockAddFilter ).toHaveBeenCalledTimes( 1 );
		} );

		it.each( [
			[ 'the flag is absent', undefined ],
			[ 'the flag is off', { draftAssist: false } ],
			[ 'other features are on but draft assist is not', { blockToolbarButton: true } ],
		] )( 'does nothing when %s', async ( _label, features ) => {
			if ( features ) {
				installFeature( features );
			}
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();

			expect( mockAddFilter ).not.toHaveBeenCalled();
			expect( stores.subscribe ).not.toHaveBeenCalled();
			expect( stores.updateSettings ).not.toHaveBeenCalled();
		} );

		it( 'does nothing when the sidebar itself is disabled', async () => {
			installFeature( { draftAssist: true }, false );
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();

			expect( mockAddFilter ).not.toHaveBeenCalled();
			expect( stores.updateSettings ).not.toHaveBeenCalled();
		} );

		it( 'retries when wp.data is not registered yet', async () => {
			jest.useFakeTimers();
			installFeature();
			installEditorStores( { withWpData: false } );
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			const stores = installEditorStores();
			jest.advanceTimersByTime( 300 );

			expect( stores.subscribe ).toHaveBeenCalled();
			expect( stores.updateSettings ).toHaveBeenCalledWith( {
				bodyPlaceholder: DRAFT_PLACEHOLDER,
			} );
		} );
	} );

	describe( 'placeholder', () => {
		it( 'restores the previous placeholder once the post has content', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			expect( stores.settings.bodyPlaceholder ).toBe( DRAFT_PLACEHOLDER );

			stores.setPostEmpty( false );
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( DEFAULT_PLACEHOLDER );
		} );

		it( 're-applies the prompt when the editor pushes its own settings back', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			// The editor recomputes its settings and overwrites ours.
			stores.settings.bodyPlaceholder = DEFAULT_PLACEHOLDER;
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( DRAFT_PLACEHOLDER );
		} );

		it( 'does not restore a placeholder someone else now owns', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			stores.settings.bodyPlaceholder = 'Another plugin owns this';
			stores.setPostEmpty( false );
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( 'Another plugin owns this' );
		} );

		it( 'stays out of the way on unsupported post types', async () => {
			installFeature();
			const stores = installEditorStores( { postType: 'wp_template' } );
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();

			expect( stores.updateSettings ).not.toHaveBeenCalled();
			expect( stores.settings.bodyPlaceholder ).toBe( DEFAULT_PLACEHOLDER );
		} );

		it( 'survives a selector that throws instead of breaking the store loop', async () => {
			installFeature();
			const stores = installEditorStores( { isEditedPostEmptyThrows: true } );
			const { registerDraftEntry } = await loadDraftEntry();

			// A throw here would otherwise propagate into wp.data's listener loop
			// and take out every other subscriber on the page.
			expect( () => registerDraftEntry() ).not.toThrow();
			expect( () => stores.notify() ).not.toThrow();
			expect( stores.updateSettings ).not.toHaveBeenCalled();
		} );

		it( 'survives getSettings throwing', async () => {
			installFeature();
			const stores = installEditorStores( { getSettingsThrows: true } );
			const { registerDraftEntry } = await loadDraftEntry();

			expect( () => registerDraftEntry() ).not.toThrow();
			expect( () => stores.notify() ).not.toThrow();
			expect( stores.updateSettings ).not.toHaveBeenCalled();
		} );

		it( 'does not track the entry point as shown', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			stores.settings.bodyPlaceholder = DEFAULT_PLACEHOLDER;
			stores.notify();

			// Setting `bodyPlaceholder` renders nothing on Gutenberg 23.8+, so counting
			// it as shown reported a prompt the writer never saw. The placeholder HOC
			// records it instead, when it actually reaches the screen.
			expect( getTracksCalls( 'jetpack_ai_draft_assist_entry_point_shown' ) ).toEqual( [] );
		} );
	} );

	describe( 'subscription lifetime', () => {
		it( 'unsubscribes instead of syncing forever on an unsupported post type', async () => {
			installFeature();
			const stores = installEditorStores( { postType: 'wp_template' } );
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();

			expect( stores.unsubscribe ).toHaveBeenCalledTimes( 1 );
			expect( stores.listenerCount() ).toBe( 0 );
		} );

		it( 'keeps listening until the editor has resolved a post type', async () => {
			installFeature();
			const stores = installEditorStores( { postType: '' } );
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			expect( stores.unsubscribe ).not.toHaveBeenCalled();
			expect( stores.updateSettings ).not.toHaveBeenCalled();

			stores.setPostType( 'post' );
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( DRAFT_PLACEHOLDER );
			expect( stores.listenerCount() ).toBe( 1 );
		} );

		it( 'gives the placeholder back and stops when the post type turns out unsupported', async () => {
			installFeature();
			const stores = installEditorStores( { postType: '' } );
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			stores.setPostType( 'post' );
			stores.notify();
			expect( stores.settings.bodyPlaceholder ).toBe( DRAFT_PLACEHOLDER );

			stores.setPostType( 'wp_template' );
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( DEFAULT_PLACEHOLDER );
			expect( stores.unsubscribe ).toHaveBeenCalledTimes( 1 );
			expect( stores.listenerCount() ).toBe( 0 );
		} );

		it( 'stops when the feature flag stops being available', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry } = await loadDraftEntry();

			registerDraftEntry();
			delete ( globalThis as any ).agentsManagerData;
			stores.notify();

			expect( stores.settings.bodyPlaceholder ).toBe( DEFAULT_PLACEHOLDER );
			expect( stores.unsubscribe ).toHaveBeenCalledTimes( 1 );
			expect( stores.listenerCount() ).toBe( 0 );
		} );

		it( 'stops syncing after an explicit teardown', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry, stopBodyPlaceholderSync } = await loadDraftEntry();

			registerDraftEntry();
			stopBodyPlaceholderSync();
			stores.updateSettings.mockClear();
			stores.settings.bodyPlaceholder = DEFAULT_PLACEHOLDER;
			stores.notify();

			expect( stores.unsubscribe ).toHaveBeenCalledTimes( 1 );
			expect( stores.listenerCount() ).toBe( 0 );
			expect( stores.updateSettings ).not.toHaveBeenCalled();
			expect( stores.settings.bodyPlaceholder ).toBe( DEFAULT_PLACEHOLDER );
		} );

		it( 'is safe to tear down more than once, and before anything subscribed', async () => {
			installFeature();
			const stores = installEditorStores();
			const { registerDraftEntry, stopBodyPlaceholderSync } = await loadDraftEntry();

			expect( () => stopBodyPlaceholderSync() ).not.toThrow();
			registerDraftEntry();
			stopBodyPlaceholderSync();

			expect( () => stopBodyPlaceholderSync() ).not.toThrow();
			expect( stores.unsubscribe ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'completer', () => {
		it( 'adds a Draft with AI option that matches "/draft"', async () => {
			installFeature();
			installEditorStores();
			const { addDraftCompleter, DRAFT_COMPLETER_NAME, DRAFT_TRIGGER_PREFIX } =
				await loadDraftEntry();

			const completers = addDraftCompleter( [] ) as any[];
			const completer = completers.find( ( item ) => item.name === DRAFT_COMPLETER_NAME );

			expect( completer ).toBeDefined();
			expect( completer.triggerPrefix ).toBe( DRAFT_TRIGGER_PREFIX );
			expect( completer.options ).toHaveLength( 1 );
			expect( completer.getOptionLabel( completer.options[ 0 ] ) ).toBe( 'Draft with AI' );
			expect( matchesQuery( completer, completer.options[ 0 ], '' ) ).toBe( true );
			expect( matchesQuery( completer, completer.options[ 0 ], 'draft' ) ).toBe( true );
			expect( matchesQuery( completer, completer.options[ 0 ], 'zzz' ) ).toBe( false );
		} );

		it( 'leaves the core "/" block inserter in charge of plain slash input', async () => {
			installFeature();
			installEditorStores();
			const { addDraftCompleter, DRAFT_COMPLETER_NAME } = await loadDraftEntry();

			const blockCompleter = { name: 'blocks', triggerPrefix: '/' };
			const completers = addDraftCompleter( [ blockCompleter ] ) as any[];

			// Gutenberg resolves ties on trigger prefix by array order, so ours
			// must neither come first nor share the bare "/" prefix.
			expect( completers[ 0 ] ).toBe( blockCompleter );
			expect(
				completers.find( ( item ) => item.name === DRAFT_COMPLETER_NAME ).triggerPrefix
			).not.toBe( '/' );
		} );

		it( 'does not add the completer twice', async () => {
			installFeature();
			installEditorStores();
			const { addDraftCompleter, DRAFT_COMPLETER_NAME } = await loadDraftEntry();

			const once = addDraftCompleter( [] ) as any[];
			const twice = addDraftCompleter( once ) as any[];

			expect( twice.filter( ( item ) => item.name === DRAFT_COMPLETER_NAME ) ).toHaveLength( 1 );
		} );

		it.each( [
			[ 'the flag is off', { draftAssist: false }, 'post' ],
			[ 'the post type is unsupported', { draftAssist: true }, 'wp_template' ],
		] )( 'adds nothing when %s', async ( _label, features, postType ) => {
			installFeature( features );
			installEditorStores( { postType } );
			const { addDraftCompleter } = await loadDraftEntry();

			expect( addDraftCompleter( [] ) ).toEqual( [] );
		} );

		it( 'fires the trigger and clears the typed command on selection', async () => {
			installFeature();
			installEditorStores();
			const { setChatOpen, submitChatMessage } = installAgentsManagerActions();
			const { addDraftCompleter } = await loadDraftEntry();

			const completer = ( addDraftCompleter( [] ) as any[] )[ 0 ];
			const completion = completer.getOptionCompletion();

			expect( completion ).toEqual( { action: 'insert-at-caret', value: '' } );
			expect( setChatOpen ).toHaveBeenCalledWith( true );
			expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me draft this post' );
		} );
	} );

	describe( 'trigger', () => {
		it( 'opens the chat and submits the post prompt', async () => {
			installFeature();
			installEditorStores();
			const { setChatOpen, submitChatMessage, setChatInput } = installAgentsManagerActions();
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );

			expect( setChatOpen ).toHaveBeenCalledWith( true );
			expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me draft this post' );
			expect( setChatInput ).not.toHaveBeenCalled();
			expect( getTracksCalls( 'jetpack_ai_draft_assist_entry_point_triggered' ) ).toEqual( [
				[
					'jetpack_ai_draft_assist_entry_point_triggered',
					{ content_type: 'post', from_slash_command: true },
				],
			] );
		} );

		it( 'submits the page prompt on pages', async () => {
			installFeature();
			installEditorStores( { postType: 'page' } );
			const { submitChatMessage } = installAgentsManagerActions();
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );

			expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me draft this page' );
			expect( getTracksCalls( 'jetpack_ai_draft_assist_entry_point_triggered' ) ).toEqual( [
				[
					'jetpack_ai_draft_assist_entry_point_triggered',
					{ content_type: 'page', from_slash_command: true },
				],
			] );
		} );

		it( 'records a trigger that did not come from the slash command', async () => {
			installFeature();
			installEditorStores();
			installAgentsManagerActions();
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist();

			expect( getTracksCalls( 'jetpack_ai_draft_assist_entry_point_triggered' ) ).toEqual( [
				[
					'jetpack_ai_draft_assist_entry_point_triggered',
					{ content_type: 'post', from_slash_command: false },
				],
			] );
		} );

		it( 'waits for agents-manager-ready before driving the chat', async () => {
			installFeature();
			installEditorStores();
			const { setChatOpen, submitChatMessage } = installAgentsManagerActions( {
				isReady: false,
			} );
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );
			expect( setChatOpen ).not.toHaveBeenCalled();

			( window as any ).__agentsManagerActions.isReady = true;
			window.dispatchEvent( new Event( 'agents-manager-ready' ) );

			expect( setChatOpen ).toHaveBeenCalledWith( true );
			expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me draft this post' );
		} );

		it( 'waits for the chat composer to mount before submitting', async () => {
			jest.useFakeTimers();
			installFeature();
			installEditorStores();
			const actions = installAgentsManagerActions( { withSubmit: false } );
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );
			expect( actions.setChatOpen ).toHaveBeenCalledWith( true );

			const submitChatMessage = jest.fn( () => Promise.resolve() );
			( window as any ).__agentsManagerActions.submitChatMessage = submitChatMessage;
			jest.advanceTimersByTime( 100 );

			expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me draft this post' );
			expect( actions.setChatInput ).not.toHaveBeenCalled();
		} );

		it( 'falls back to the composer input when submitChatMessage never appears', async () => {
			jest.useFakeTimers();
			installFeature();
			installEditorStores();
			const { setChatInput } = installAgentsManagerActions( { withSubmit: false } );
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );
			jest.advanceTimersByTime( 100 * 50 );

			expect( setChatInput ).toHaveBeenCalledWith( 'Help me draft this post' );
		} );

		it( 'falls back to the composer input when the submit rejects', async () => {
			installFeature();
			installEditorStores();
			const { setChatInput } = installAgentsManagerActions( { submitRejects: true } );
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );
			await Promise.resolve();
			await Promise.resolve();

			expect( setChatInput ).toHaveBeenCalledWith( 'Help me draft this post' );
		} );

		it.each( [
			[ 'the flag is off', { draftAssist: false }, 'post' ],
			[ 'the post type is unsupported', { draftAssist: true }, 'wp_template' ],
		] )( 'does nothing when %s', async ( _label, features, postType ) => {
			installFeature( features );
			installEditorStores( { postType } );
			const { setChatOpen, submitChatMessage } = installAgentsManagerActions();
			const { triggerDraftAssist } = await loadDraftEntry();

			triggerDraftAssist( { fromSlashCommand: true } );

			expect( setChatOpen ).not.toHaveBeenCalled();
			expect( submitChatMessage ).not.toHaveBeenCalled();
			expect( getTracksCalls( 'jetpack_ai_draft_assist_entry_point_triggered' ) ).toEqual( [] );
		} );
	} );
} );
