/**
 * Internal dependencies
 */
import { setShouldServerSideRenderLogin } from '../ssr';

function getSomeCleanLoginContext( queryValues ) {
	return {
		query: queryValues,
	};
}

describe( 'setShouldServerSideRenderLogin', () => {
	test( 'when query is empty, then sets context.serverSideRender to TRUE - and calls next()', () => {
		const next = jest.fn();
		const contextWithoutQueryKeys = getSomeCleanLoginContext( {} );

		setShouldServerSideRenderLogin( contextWithoutQueryKeys, next );
		expect( contextWithoutQueryKeys.serverSideRender ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'when query has only INVALID keys, then sets context.serverSideRender to FALSE - and calls next()', () => {
		const next = jest.fn();
		const contextWithQueryKeys = {
			query: {
				hello: 'world',
			},
		};

		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'when query has only valid keys, then serverSideRender is TRUE, but when invalid keys are added, it fails', () => {
		const next = jest.fn();
		let contextWithQueryKeys = getSomeCleanLoginContext( { client_id: 1234 } );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add one valid key, signup_flow
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 1288,
			signup_flow: 'avbsdaf',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add another valid key, redirect_to
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 87357,
			signup_flow: 'xsa',
			redirect_to: 'https://wordpress.com/theme',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( true );

		// add another random key and expect SSR to stop
		contextWithQueryKeys = getSomeCleanLoginContext( {
			client_id: 87357,
			signup_flow: 'xsa',
			redirect_to: 'https://wordpress.com/theme',
			hello: 'world',
		} );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );

		// add do one more test in which only a few of the keys are set and then the invalid key is set
		contextWithQueryKeys = getSomeCleanLoginContext( { client_id: '5678', hello: 'world' } );
		setShouldServerSideRenderLogin( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );

		// for all of the above cases, expect that next was called
		expect( next ).toHaveBeenCalledTimes( 5 ); // because we have 5 tests and we did not check for each of them
	} );

	test( 'when query has redirect_to, then only the ones starting with the prefix make SSR true', () => {
		const contextWithThemePrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://wordpress.com/theme/something',
		} );
		setShouldServerSideRenderLogin( contextWithThemePrefix, () => {} );
		expect( contextWithThemePrefix.serverSideRender ).toBe( true );

		const contextWithGoPrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://wordpress.com/go/something',
		} );
		setShouldServerSideRenderLogin( contextWithGoPrefix, () => {} );
		expect( contextWithGoPrefix.serverSideRender ).toBe( true );

		const contextWithInvalidPrefix = getSomeCleanLoginContext( {
			redirect_to: 'https://blue.com/go/something',
		} );
		setShouldServerSideRenderLogin( contextWithInvalidPrefix, () => {} );
		expect( contextWithInvalidPrefix.serverSideRender ).toBe( false );
	} );
} );
