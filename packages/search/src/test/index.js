import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useReducer } from 'react';
import { act } from 'react-dom/test-utils';
import Search from '..';

describe( 'search', () => {
	const focusResolve = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	describe( 'ref', () => {
		let ref;

		beforeEach( () => {
			ref = createRef();
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

		it( 'should return a ref with clear', async () => {
			const searchbox = screen.getByRole( 'searchbox' );
			const user = userEvent.setup();
			await user.type( searchbox, 'This is a test search' );
			expect( searchbox.value ).toBe( 'This is a test search' );
			act( () => {
				ref.current.clear();
			} );

			expect( searchbox.value ).toBe( '' );
		} );
	} );

	describe( '"on-enter" search mode', () => {
		it( "shouldn't call onSearch and onSearchChange when search changes", async () => {
			const searchString = '12345';
			const onSearch = jest.fn();
			const onSearchChange = jest.fn();
			render(
				<Search onSearch={ onSearch } searchMode="on-enter" onSearchChange={ onSearchChange } />
			);
			const searchbox = screen.getByRole( 'searchbox' );
			const user = userEvent.setup();
			await user.type( searchbox, searchString );
			expect( onSearch ).toHaveBeenCalledTimes( 0 ); // once per character
			expect( onSearchChange ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'should call onSearch and onSearchChange when user hits enter', async () => {
			const searchString = '12345{enter}';
			const onSearch = jest.fn();
			const onSearchChange = jest.fn();
			render(
				<Search onSearch={ onSearch } searchMode="on-enter" onSearchChange={ onSearchChange } />
			);
			const searchbox = screen.getByRole( 'searchbox' );
			const user = userEvent.setup();
			await user.type( searchbox, searchString );
			expect( onSearch ).toHaveBeenCalledTimes( 1 ); // once per character
			expect( onSearch ).toHaveBeenCalledWith( '12345' );
			expect( onSearchChange ).toHaveBeenCalledTimes( 1 );
			expect( onSearchChange ).toHaveBeenCalledWith( '12345' );
		} );
	} );

	it( 'should call onSearch and onSearchChange when search changes', async () => {
		const searchString = '12345';
		const onSearch = jest.fn();
		const onSearchChange = jest.fn();
		render( <Search onSearch={ onSearch } onSearchChange={ onSearchChange } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		const user = userEvent.setup();
		await user.type( searchbox, searchString );
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

	it( 'should call onKeyDown when typing into search', async () => {
		const searchString = '12345';
		const onKeyDown = jest.fn();
		render( <Search onKeyDown={ onKeyDown } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		const user = userEvent.setup();
		await user.type( searchbox, searchString );
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

	it( 'should call onSearchOpen when search is focused', async () => {
		const onSearchOpen = jest.fn();
		render( <Search onSearchOpen={ onSearchOpen } /> );
		const searchbox = screen.getByRole( 'searchbox' );
		const user = userEvent.setup();
		await user.click( searchbox );
		expect( onSearchOpen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should open and focus the search element when clicking the open search button', async () => {
		const onSearchOpen = jest.fn();
		render( <Search pinned defaultIsOpen={ false } onSearchOpen={ onSearchOpen } /> );
		const openButton = screen.getByLabelText( 'Open Search' );
		const user = userEvent.setup();
		await user.click( openButton );
		await focusResolve();
		const searchbox = screen.getByRole( 'searchbox' );
		expect( onSearchOpen ).toHaveBeenCalledTimes( 1 );
		expect( document.activeElement ).toBe( searchbox );
	} );

	it( 'should close search and call onSearchClose when clicking the close button', async () => {
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

		const user = userEvent.setup();
		await user.click( closeButton );
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

	it( 'should call onSearch without debouncing when reverting to empty keyword', async () => {
		const onSearch = jest.fn();
		render( <Search onSearch={ onSearch } defaultValue="a" delaySearch delayTimeout={ 1000 } /> );

		// check that `onSearch` has been called with the default value on mount
		expect( onSearch ).toHaveBeenCalledWith( 'a' );

		// type backspace into the search box, making its value empty
		const user = userEvent.setup();
		await user.type( screen.getByRole( 'searchbox' ), '{backspace}' );

		// check that `onSearch` has been called immediately, without debouncing
		expect( onSearch ).toHaveBeenCalledWith( '' );
	} );

	it( 'should not call onSearch with current value when the prop changes', async () => {
		function SearchWithHistory() {
			const [ history, push ] = useReducer( ( list, item ) => [ ...list, item ], [] );
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
		const user = userEvent.setup();
		await user.type( screen.getByRole( 'searchbox' ), 's' );

		// check that a second item was added to history
		expect( document.querySelectorAll( 'li' ) ).toHaveLength( 2 );
	} );

	it( 'should allow a custom search icon', () => {
		render( <Search searchIcon="CUSTOMICON" /> );

		expect( screen.getByText( 'CUSTOMICON' ) ).toBeTruthy();
	} );
} );
