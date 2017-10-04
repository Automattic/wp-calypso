/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { hasUserAskedADirectlyQuestion } from '../';

describe( 'hasUserAskedADirectlyQuestion()', () => {
	const questionData = deepFreeze( {
		questionText: 'ABC',
		name: '123',
		email: 'fake@wordpress.com',
	} );

	it( 'should be false when null', () => {
		const state = { help: { directly: { questionAsked: null } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).to.be.false;
	} );

	it( 'should be true when a question is present', () => {
		const state = { help: { directly: { questionAsked: questionData } } };
		expect( hasUserAskedADirectlyQuestion( state ) ).to.be.true;
	} );
} );
