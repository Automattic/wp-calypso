/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { QueryVerticals } from '../';

describe( 'QueryVerticals', () => {
	test( 'should call request on mount.', () => {
		const requestVerticals = jest.fn();

		render( <QueryVerticals requestVerticals={ requestVerticals } searchTerm="Foo" /> );

		expect( requestVerticals ).toHaveBeenCalled();
	} );

	test( 'should not call request on mount if no search term is given.', () => {
		const requestVerticals = jest.fn();

		render( <QueryVerticals requestVerticals={ requestVerticals } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should not call request on mount if a matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		render( <QueryVerticals requestVerticals={ requestVerticals } isFetched={ true } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should call request on update if no matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		const { rerender } = render( <QueryVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			siteType: '',
			searchTerm: 'Foo',
			limit: 7,
			isFetched: false,
		};

		rerender( <QueryVerticals requestVerticals={ requestVerticals } { ...updatedProps } /> );

		expect( requestVerticals ).toHaveBeenCalledWith(
			updatedProps.searchTerm,
			updatedProps.siteType,
			updatedProps.limit
		);
	} );

	test( 'should not call request on update if a matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		const { rerender } = render( <QueryVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			searchTerm: 'Foo',
			limit: 7,
			isFetched: true,
		};

		rerender( <QueryVerticals requestVerticals={ requestVerticals } { ...updatedProps } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should create a debounce-wrapped function if debounce time is more than 0 on mount.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		render(
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

		render(
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

		const props = {
			requestVerticals,
			debounceFunc,
			debounceTime: 100,
		};

		const { rerender } = render( <QueryVerticals { ...props } /> );

		const updatedDebounceTime = 200;

		rerender( <QueryVerticals { ...props } debounceTime={ updatedDebounceTime } /> );

		expect( debounceFunc ).toHaveBeenCalledWith( requestVerticals, updatedDebounceTime );
	} );

	test( 'should not update the debounced function if the debounce time keeps the same.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		const props = {
			requestVerticals,
			debounceFunc,
			debounceTime,
		};

		const { rerender } = render( <QueryVerticals { ...props } /> );

		debounceFunc.mockClear();

		rerender( <QueryVerticals { ...props } /> );

		expect( debounceFunc ).not.toHaveBeenCalled();
	} );
} );
