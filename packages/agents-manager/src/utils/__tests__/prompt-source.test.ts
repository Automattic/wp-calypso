import {
	consumePromptSource,
	markNextPromptSource,
	subscribeToDispatchedPromptSources,
} from '../prompt-source';

const CHECKLIST = { source: 'site-setup-checklist', id: 'design' };

describe( 'prompt source', () => {
	afterEach( () => {
		consumePromptSource( '' );
	} );

	it( 'hands the declared source to the send of its own prompt, once', () => {
		markNextPromptSource( CHECKLIST, 'Help me with: design' );

		expect( consumePromptSource( 'Help me with: design ' ) ).toEqual( CHECKLIST );
		expect( consumePromptSource( 'Help me with: design' ) ).toBeUndefined();
	} );

	it( 'drops the declared source when another message is sent first', () => {
		markNextPromptSource( CHECKLIST, 'Help me with: design' );

		expect( consumePromptSource( 'Something else' ) ).toBeUndefined();
		expect( consumePromptSource( 'Help me with: design' ) ).toBeUndefined();
	} );

	it( 'tells subscribers about a dispatched source, not a dropped one, until they unsubscribe', () => {
		const listener = jest.fn();
		const unsubscribe = subscribeToDispatchedPromptSources( listener );

		markNextPromptSource( CHECKLIST, 'Help me with: design' );
		consumePromptSource( 'Something else' );
		expect( listener ).not.toHaveBeenCalled();

		markNextPromptSource( CHECKLIST, 'Help me with: design' );
		consumePromptSource( 'Help me with: design' );
		expect( listener ).toHaveBeenCalledWith( CHECKLIST );

		unsubscribe();
		markNextPromptSource( CHECKLIST, 'Help me with: design' );
		consumePromptSource( 'Help me with: design' );
		expect( listener ).toHaveBeenCalledTimes( 1 );
	} );
} );
