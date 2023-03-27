import { renderHook, act } from '@testing-library/react-hooks';
import { useLogPagination } from '../hooks/use-log-pagination';

test( 'returns initial pagination state', () => {
	const { result } = renderHook( () => useLogPagination() );
	expect( result.current ).toMatchObject( {
		// Show 0th page first
		currentPageIndex: 0,

		// Do not pass a scroll ID to the logging API
		currentScrollId: undefined,
	} );
} );

test( 'advancing to the next page advances the scroll ID', () => {
	const { result } = renderHook( () => useLogPagination() );

	const { handlePageLoad, handlePageClick } = result.current;

	act( () => handlePageLoad( { nextScrollId: 'pageA' } ) );

	act( () => handlePageClick( 1 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageB' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 1,
		currentScrollId: 'pageA',
	} );
} );

test( 'advance forwards and back', () => {
	const { result } = renderHook( () => useLogPagination() );

	const { handlePageLoad, handlePageClick } = result.current;

	act( () => handlePageLoad( { nextScrollId: 'pageA' } ) );

	act( () => handlePageClick( 1 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageB' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 1,
		currentScrollId: 'pageA',
	} );

	act( () => handlePageClick( 0 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageA' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 0,
		currentScrollId: undefined,
	} );
} );

test( 'advance 2 forwards and 1 back', () => {
	const { result } = renderHook( () => useLogPagination() );

	const { handlePageLoad, handlePageClick } = result.current;

	act( () => handlePageLoad( { nextScrollId: 'pageA' } ) );

	act( () => handlePageClick( 1 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageB' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 1,
		currentScrollId: 'pageA',
	} );

	act( () => handlePageClick( 2 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageC' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 2,
		currentScrollId: 'pageB',
	} );

	act( () => handlePageClick( 1 ) );
	act( () => handlePageLoad( { nextScrollId: 'pageB' } ) );

	expect( result.current ).toMatchObject( {
		currentPageIndex: 1,
		currentScrollId: 'pageA',
	} );
} );
