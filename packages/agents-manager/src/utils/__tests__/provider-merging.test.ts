import {
	mergeCapabilitiesInto,
	mergeContextProviders,
	mergeUseSuggestionsHooks,
} from '../provider-merging';
import type { ProviderCapabilities, UseSuggestionsHook } from '../load-external-providers';

describe( 'mergeCapabilitiesInto', () => {
	it( 'only enables split screen for an explicit true flag', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, undefined );
		mergeCapabilitiesInto( merged, null );
		mergeCapabilitiesInto( merged, 'oops' );
		mergeCapabilitiesInto( merged, 42 );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'false' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'true' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 1 } );
		expect( merged.supportsSplitScreen ).toBeUndefined();

		mergeCapabilitiesInto( merged, { supportsSplitScreen: true } );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );

	it( 'reads capabilities via property access (Proxy-safe)', () => {
		// Mirrors the lazy proxy shape used by jetpack-ai-sidebar.provider.mjs.
		// Object.entries() on this Proxy returns [], so the function must
		// probe each known key by direct access to hit the get trap.
		const lazyCapabilities = new Proxy(
			{},
			{ get: ( _target, prop ) => ( prop === 'supportsSplitScreen' ? true : undefined ) }
		);
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, lazyCapabilities );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );
} );

describe( 'mergeContextProviders', () => {
	it( 'preserves earlier provider editor context while filling missing fields from later providers', () => {
		const provider = mergeContextProviders( [
			{
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'wp-admin',
					currentScreen: {
						url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					},
					currentPageContent: [ { id: 'big-sky-block' } ],
					selectedBlockClientId: 'short-selected-id',
					contextEntries: [
						{
							id: 'big-sky-page-context',
							type: 'big-sky-page-context',
						},
					],
				} ),
			},
			{
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'gutenberg',
					titleSuggestionCount: 3,
					currentScreen: {
						postType: 'page',
					},
					currentPageContent: [ { id: 'jetpack-block' } ],
					selectedBlockClientId: 'short-selected-id',
					contextEntries: [
						{
							id: 'selected-block-content',
							type: 'selected-block-content',
							data: { content: 'Selected text' },
						},
					],
				} ),
			},
		] );

		expect( provider?.getClientContext() ).toEqual(
			expect.objectContaining( {
				environment: 'wp-admin',
				titleSuggestionCount: 3,
				currentScreen: {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					postType: 'page',
				},
				currentPageContent: [ { id: 'big-sky-block' } ],
				selectedBlockClientId: 'short-selected-id',
				contextEntries: [
					{
						id: 'big-sky-page-context',
						type: 'big-sky-page-context',
					},
					{
						id: 'selected-block-content',
						type: 'selected-block-content',
						data: { content: 'Selected text' },
					},
				],
			} )
		);
	} );
} );

describe( 'mergeUseSuggestionsHooks', () => {
	it( 'treats undefined provider hook results as no suggestions', () => {
		const undefinedHook = jest.fn( () => undefined ) as UseSuggestionsHook;
		const suggestionsHook = jest.fn( () => ( {
			suggestions: [ { id: 'reader-followup', label: 'Follow up', prompt: 'Follow up on this.' } ],
		} ) ) as UseSuggestionsHook;

		const merged = mergeUseSuggestionsHooks( [ undefinedHook, suggestionsHook ] );

		expect( merged?.() ).toEqual( {
			suggestions: [ { id: 'reader-followup', label: 'Follow up', prompt: 'Follow up on this.' } ],
		} );
	} );

	it( 'dedupes suggestions by id when multiple providers return suggestions', () => {
		const firstHook = jest.fn( () => ( {
			suggestions: [
				{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
				{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
			],
		} ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( {
			suggestions: [
				{ id: 'shared', label: 'Second shared', prompt: 'Second shared prompt.' },
				{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
			],
		} ) ) as UseSuggestionsHook;

		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );

		expect( merged?.() ).toEqual( {
			suggestions: [
				{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
				{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
				{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
			],
		} );
	} );

	it( 'forwards suggestion visibility options to provider hooks', () => {
		const firstHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );
		const options = { suggestionsVisible: false };

		merged?.( undefined, options );

		expect( firstHook ).toHaveBeenCalledWith( undefined, options );
		expect( secondHook ).toHaveBeenCalledWith( undefined, options );
	} );
} );
