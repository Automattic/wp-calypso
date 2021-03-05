/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { QuerySegments } from '../';

describe( 'QuerySegments', () => {
	test( 'should mount as an empty object', () => {
		const requestSegments = jest.fn();
		const wrapped = shallow( <QuerySegments requestSegments={ requestSegments } /> );

		expect( wrapped ).toEqual( {} );
	} );

	test( 'should call request on mount.', () => {
		const requestSegments = jest.fn();

		shallow( <QuerySegments requestSegments={ requestSegments } /> );

		expect( requestSegments ).toHaveBeenCalled();
	} );

	test( 'should not call request on mount if segments have been already populated.', () => {
		const requestSegments = jest.fn();

		shallow(
			<QuerySegments requestSegments={ requestSegments } segments={ [ { a: 1 }, { b: 2 } ] } />
		);

		expect( requestSegments ).not.toHaveBeenCalled();
	} );
} );
