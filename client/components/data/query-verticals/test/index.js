/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { QueryVerticals } from '../';

describe( 'QueryVerticals', () => {
	test( 'should mount as an empty object', () => {
		const wrapped = shallow( <QueryVerticals /> );

		expect( wrapped ).toEqual( {} );
	} );

	test( 'should call request on mount.', () => {
		const requestVerticals = jest.fn();

		shallow( <QueryVerticals requestVerticals={ requestVerticals } searchTerm="Foo" /> );

		expect( requestVerticals ).toHaveBeenCalled();
	} );

	test( 'should not call request on mount if no search term is given.', () => {
		const requestVerticals = jest.fn();

		shallow( <QueryVerticals requestVerticals={ requestVerticals } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should not call request on mount if search term is falsey.', () => {
		const requestVerticals = jest.fn();
		const wrapped = shallow( <QueryVerticals requestVerticals={ requestVerticals } /> );
		const updatedProps = {
			searchTerm: undefined,
			limit: 7,
			isFetched: true,
		};

		wrapped.setProps( updatedProps );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should not call request on update if isFetched is true.', () => {
		const requestVerticals = jest.fn();

		const wrapped = shallow( <QueryVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			searchTerm: 'Foo',
			limit: 7,
			isFetched: true,
		};

		wrapped.setProps( updatedProps );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );
} );
