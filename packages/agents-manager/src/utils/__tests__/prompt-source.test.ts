import { consumePromptSource, markNextPromptSource } from '../prompt-source';

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
} );
