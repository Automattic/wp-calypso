/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import hasUserAskedADirectlyQuestion from 'calypso/state/selectors/has-user-asked-a-directly-question';

describe( 'hasUserAskedADirectlyQuestion()', () => {
	const questionData = deepFreeze( {
		questionText: 'ABC',
		name: '123',
		email: 'fake@wordpress.com',
	} );

	test( 'should be false when null', () => {
		const state = { help: { directly: { questionAsked: null } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).to.be.false;
	} );

	test( 'should be true when a question is present', () => {
		const state = { help: { directly: { questionAsked: questionData } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).to.be.true;
	} );
} );
