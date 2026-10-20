import {
	clearPromptSource,
	getPromptSource,
	markNextPromptSource,
	takePromptSource,
} from '../prompt-source';

describe( 'prompt source', () => {
	afterEach( () => {
		takePromptSource( '' );
		clearPromptSource();
	} );

	it( 'applies the declared source to the send of its own prompt only', () => {
		markNextPromptSource( 'site-setup-checklist', 'Help me with: design' );

		takePromptSource( 'Help me with: design ' );
		expect( getPromptSource() ).toBe( 'site-setup-checklist' );

		clearPromptSource();
		expect( getPromptSource() ).toBeNull();
	} );

	it( 'drops the declared source when another message is sent first', () => {
		markNextPromptSource( 'site-setup-checklist', 'Help me with: design' );

		takePromptSource( 'Something else' );
		expect( getPromptSource() ).toBeNull();

		takePromptSource( 'Help me with: design' );
		expect( getPromptSource() ).toBeNull();
	} );
} );
