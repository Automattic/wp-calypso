import hasUserAskedADirectlyQuestion from 'calypso/state/selectors/has-user-asked-a-directly-question';

describe( 'hasUserAskedADirectlyQuestion()', () => {
	test( 'should be false when null', () => {
		const state = { help: { directly: { questionAsked: null } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).toBe( false );
	} );

	test( 'should be true when a question is present', () => {
		const state = { help: { directly: { questionAsked: true } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).toBe( true );
	} );
} );
