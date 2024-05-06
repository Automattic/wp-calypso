/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { MatcherFunction } from '@jest/expect';

interface AsymmetricMatcher {
	asymmetricMatch: ( value: unknown ) => boolean;
}

export const toMatchPathAndSearchParams: MatcherFunction<
	[ path: string, searchParams?: Record< string, string | number | AsymmetricMatcher > ]
> = (
	actual: unknown,
	path: string,
	searchParams: Record< string, string | number | AsymmetricMatcher > = {}
) => {
	if ( typeof actual !== 'string' && ! ( actual instanceof URL ) ) {
		throw new TypeError( 'toMatchPathAndSearchParams expects a string or URL' );
	}

	const url = actual instanceof URL ? actual : new URL( actual, 'https://example.com' );

	const pass =
		url.pathname === path &&
		Object.entries( searchParams ).every( ( [ key, value ] ) => {
			if ( typeof value === 'object' && typeof value.asymmetricMatch === 'function' ) {
				return value.asymmetricMatch( url.searchParams.get( key ) );
			}

			return url.searchParams.get( key ) === value.toString();
		} );
	if ( pass ) {
		return {
			pass,
			message: () =>
				`Expected ${ actual } not to match path ${ path } and search params ${ JSON.stringify(
					searchParams
				) }`,
		};
	}

	return {
		pass,
		message: () =>
			`Expected ${ actual } to match path ${ path } and search params ${ JSON.stringify(
				searchParams
			) }`,
	};
};

expect.extend( { toMatchPathAndSearchParams } );

declare module 'expect' {
	interface AsymmetricMatchers {
		toMatchPathAndSearchParams(
			path: string,
			searchParams: Record< string, string | number | ( ( actual: unknown ) => ExpectationResult ) >
		): void;
	}

	interface Matchers< R > {
		toMatchPathAndSearchParams(
			path: string,
			searchParams: Record< string, string | number | ( ( actual: unknown ) => ExpectationResult ) >
		): R;
	}
}
