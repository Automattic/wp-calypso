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

	test( 'should not call request on mount if a matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		shallow( <QueryVerticals requestVerticals={ requestVerticals } isFetched /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should call request on update if no matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		const wrapped = shallow( <QueryVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			siteType: '',
			searchTerm: 'Foo',
			limit: 7,
			isFetched: false,
		};

		wrapped.setProps( updatedProps );

		expect( requestVerticals ).toHaveBeenCalledWith(
			updatedProps.searchTerm,
			updatedProps.siteType,
			updatedProps.limit
		);
	} );

	test( 'should not call request on update if a matching fetched result is found in state.', () => {
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

	test( 'should create a debounce-wrapped function if debounce time is more than 0 on mount.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		shallow(
			<QueryVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ debounceTime }
			/>
		);

		expect( debounceFunc ).toHaveBeenCalledWith( requestVerticals, debounceTime );
	} );

	test( 'should not create a debounce-wrapped function if debounce time is 0.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();

		shallow(
			<QueryVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ 0 }
			/>
		);

		expect( debounceFunc ).not.toHaveBeenCalled();
	} );

	test( 'should update the debounced function if the debounce time has changed.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();

		const wrapped = shallow(
			<QueryVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ 100 }
			/>
		);

		const updatedDebounceTime = 200;

		wrapped.setProps( {
			debounceTime: updatedDebounceTime,
		} );

		expect( debounceFunc ).toHaveBeenCalledWith( requestVerticals, updatedDebounceTime );
	} );

	test( 'should not update the debounced function if the debounce time keeps the same.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		const wrapped = shallow(
			<QueryVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ debounceTime }
			/>
		);

		debounceFunc.mockClear();

		wrapped.setProps( {
			debounceTime,
		} );

		expect( debounceFunc ).not.toHaveBeenCalled();
	} );
} );
