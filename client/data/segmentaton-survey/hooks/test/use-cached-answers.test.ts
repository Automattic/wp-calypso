/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useCachedAnswers from '../use-cached-answers';

const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	length: 0,
	key: jest.fn(),
};

describe( 'useCachedAnswers', () => {
	beforeEach( () => {
		global.localStorage = localStorageMock;
	} );

	it( 'should update cached answers', () => {
		const surveyKey = 'test-key';
		const initialAnswers = { question1: [ 'option-1' ], question2: [ 'option-3' ] };
		const updatedAnswers = { question1: [ 'option-1', 'option-2' ], question2: [ 'option-3' ] };

		const { result } = renderHook( () => useCachedAnswers( surveyKey ) );

		act( () => {
			result.current.setAnswers( initialAnswers );
		} );

		expect( result.current.answers ).toEqual( initialAnswers );

		act( () => {
			result.current.setAnswers( updatedAnswers );
		} );

		expect( result.current.answers ).toEqual( updatedAnswers );
	} );
} );
