import { DEFAULT_EMPTY_VIEW_SUGGESTION_IDS } from '../../hooks/use-empty-view-suggestions';
import { mergeEmptyViewSuggestions } from '../merge-empty-view-suggestions';

const customChip = {
	id: 'customize-colors',
	label: 'Customize colors',
	prompt: 'Show me color palettes for my site.',
};

const dynamicSuggestion = {
	id: 'improve-writing',
	label: 'Improve writing',
	prompt: 'Improve the writing in this post.',
};

const defaultChip = {
	id: DEFAULT_EMPTY_VIEW_SUGGESTION_IDS.gettingStarted,
	label: 'Getting started',
	prompt: 'Help me get started.',
};

describe( 'mergeEmptyViewSuggestions', () => {
	it( 'returns empty-view suggestions unchanged when there are no dynamic suggestions', () => {
		expect( mergeEmptyViewSuggestions( [ customChip ], [] ) ).toEqual( [ customChip ] );
	} );

	it( 'replaces default empty-view chips with dynamic suggestions', () => {
		expect( mergeEmptyViewSuggestions( [ defaultChip ], [ dynamicSuggestion ] ) ).toEqual( [
			dynamicSuggestion,
		] );
	} );

	it( 'shows custom provider chips alongside dynamic suggestions', () => {
		expect( mergeEmptyViewSuggestions( [ customChip ], [ dynamicSuggestion ] ) ).toEqual( [
			customChip,
			dynamicSuggestion,
		] );
	} );

	it( 'replaces custom provider chips with contextual dynamic suggestions', () => {
		expect( mergeEmptyViewSuggestions( [ customChip ], [ dynamicSuggestion ], true ) ).toEqual( [
			dynamicSuggestion,
		] );
	} );

	it( 'keeps contextual empty states empty instead of restoring provider chips', () => {
		expect( mergeEmptyViewSuggestions( [ customChip ], [], true ) ).toEqual( [] );
	} );

	it( 'dedupes suggestions with the same id across provider chips and dynamic suggestions', () => {
		const dynamicDuplicate = {
			id: customChip.id,
			label: 'Dynamic duplicate',
			prompt: 'A dynamic suggestion sharing an id with a provider chip.',
		};

		expect(
			mergeEmptyViewSuggestions( [ customChip ], [ dynamicDuplicate, dynamicSuggestion ] )
		).toEqual( [ customChip, dynamicSuggestion ] );
	} );

	it( 'dedupes repeated ids within the dynamic suggestions', () => {
		expect(
			mergeEmptyViewSuggestions( [], [ dynamicSuggestion, { ...dynamicSuggestion } ] )
		).toEqual( [ dynamicSuggestion ] );
	} );
} );
