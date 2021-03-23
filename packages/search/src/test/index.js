/**
 * External dependencies
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import Search from '..';

describe( 'search', () => {
	const focusResolve = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	describe( 'ref', () => {
		let ref;

		beforeEach( () => {
			ref = React.createRef();
			render( <Search ref={ ref } /> );
		} );

		const doCallFocus = ( innerRef ) => {
			act( () => {
				innerRef.current.focus();
			} );

			// Unfortunately we need to wait for `focus` to run as it puts itself at the end of the stack by calling to setTimeout
			// is there a better way to test this that doesn't leak the implementation detail?
			return focusResolve();
		};

		it( 'should have focus', async () => {
			const searchbox = screen.getByRole( 'searchbox' );
			expect( document.activeElement ).not.toBe( searchbox );
			await doCallFocus( ref );
			expect( document.activeElement ).toBe( searchbox );
		} );

		it( 'should return a ref with blur', async () => {
			const searchbox = screen.getByRole( 'searchbox' );
			await doCallFocus( ref );
			expect( document.activeElement ).toBe( searchbox );
			ref.current.blur();
			expect( document.activeElement ).not.toBe( searchbox );
		} );

		it( 'should return a ref with clear', () => {
			const searchbox = screen.getByRole( 'searchbox' );
			userEvent.type( searchbox, 'This is a test search' );
			expect( searchbox.value ).toBe( 'This is a test search' );
			act( () => {
				ref.current.clear();
			} );

			expect( searchbox.value ).toBe( '' );
		} );
	} );

	it( 'should call onSearch and onSearchChange when search changes', () => {
		const searchString = '12345';
		const onSearch = jest.fn();
		const onSearchChange = jest.fn();
		render( <Search onSearch={ onSearch } onSearchChange={ onSearchChange } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.type( searchbox, searchString );
		expect( onSearch ).toHaveBeenCalledTimes( 5 ); // once per character
		expect( onSearch ).toHaveBeenCalledWith( '1' );
		expect( onSearch ).toHaveBeenCalledWith( '12' );
		expect( onSearch ).toHaveBeenCalledWith( '123' );
		expect( onSearch ).toHaveBeenCalledWith( '1234' );
		expect( onSearch ).toHaveBeenCalledWith( '12345' );
		expect( onSearchChange ).toHaveBeenCalledTimes( 5 );
		expect( onSearchChange ).toHaveBeenCalledWith( '1' );
		expect( onSearchChange ).toHaveBeenCalledWith( '12' );
		expect( onSearchChange ).toHaveBeenCalledWith( '123' );
		expect( onSearchChange ).toHaveBeenCalledWith( '1234' );
		expect( onSearchChange ).toHaveBeenCalledWith( '12345' );
	} );

	it( 'should call onKeyDown when typing into search', () => {
		const searchString = '12345';
		const onKeyDown = jest.fn();
		render( <Search onKeyDown={ onKeyDown } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.type( searchbox, searchString );
		expect( onKeyDown ).toHaveBeenCalledTimes( 5 ); // once per character
		// it gets called with the raw event, so it's not really possible to assert what it was called with
	} );

	it( 'should generate a unique id for each searchbox', () => {
		render( <Search /> );
		render( <Search /> );
		render( <Search /> );

		const searchboxes = screen.getAllByRole( 'searchbox' );
		expect( searchboxes ).toHaveLength( 3 );
		// put the ids into object keys to get the unique IDs
		const uniqueIds = Object.keys(
			searchboxes.reduce( ( acc, s ) => ( { ...acc, [ s.id ]: true } ), {} )
		);
		expect( uniqueIds ).toHaveLength( 3 );
	} );

	it( 'should call onSearchOpen when search is focused', () => {
		const onSearchOpen = jest.fn();
		render( <Search onSearchOpen={ onSearchOpen } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.click( searchbox );
		expect( onSearchOpen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should open and focus the search element when clicking the open search button', async () => {
		const onSearchOpen = jest.fn();
		render( <Search pinned defaultIsOpen={ false } onSearchOpen={ onSearchOpen } /> );
		const openButton = screen.getByLabelText( 'Open Search' );
		userEvent.click( openButton );
		await focusResolve();
		const searchbox = screen.getByRole( 'searchbox' );
		expect( onSearchOpen ).toHaveBeenCalledTimes( 1 );
		expect( document.activeElement ).toBe( searchbox );
	} );

	it( 'should close search and call onSearchClose when clicking the close button', () => {
		const onSearchClose = jest.fn();
		render(
			<Search
				pinned
				defaultIsOpen
				defaultValue="test default search value"
				onSearchClose={ onSearchClose }
			/>
		);

		const closeButton = screen.getByLabelText( 'Close Search' );

		userEvent.click( closeButton );
		const searchbox = screen.queryByRole( 'searchbox' );
		expect( searchbox ).toBeNull();
		expect( onSearchClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should call onSearch without debouncing when a default value is provided but not call onSearchChange', () => {
		const onSearch = jest.fn();
		const onSearchChange = jest.fn();
		const defaultValue = 'a default search value';
		render(
			<Search
				onSearch={ onSearch }
				onSearchChange={ onSearchChange }
				defaultValue={ defaultValue }
				delaySearch
				delayTimeout={ 1000 }
			/>
		);
		// Just assert that onSearch was called immediately, if it is debounced then this assertion will fail.
		expect( onSearch ).toHaveBeenCalledWith( defaultValue );
		expect( onSearchChange ).not.toHaveBeenCalled();
	} );

	it( 'should call onSearch without debouncing when reverting to empty keyword', () => {
		const onSearch = jest.fn();
		render( <Search onSearch={ onSearch } defaultValue="a" delaySearch delayTimeout={ 1000 } /> );

		// check that `onSearch` has been called with the default value on mount
		expect( onSearch ).toHaveBeenCalledWith( 'a' );

		// type backspace into the search box, making its value empty
		userEvent.type( screen.getByRole( 'searchbox' ), '{backspace}' );

		// check that `onSearch` has been called immediately, without debouncing
		expect( onSearch ).toHaveBeenCalledWith( '' );
	} );

	it( 'should not call onSearch with current value when the prop changes', () => {
		function SearchWithHistory() {
			const [ history, push ] = React.useReducer( ( list, item ) => [ ...list, item ], [] );
			return (
				<div>
					<Search defaultValue="start" onSearch={ ( keyword ) => push( keyword ) } />
					<ul>
						{ history.map( ( h, i ) => (
							<li key={ i }>{ h }</li>
						) ) }
					</ul>
				</div>
			);
		}

		render( <SearchWithHistory /> );

		// check that the default value is in history
		expect( document.querySelectorAll( 'li' ) ).toHaveLength( 1 );

		// type one letter into the search box
		userEvent.type( screen.getByRole( 'searchbox' ), 's' );

		// check that a second item was added to history
		expect( document.querySelectorAll( 'li' ) ).toHaveLength( 2 );
	} );
} );
