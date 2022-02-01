import { redirectTiers } from '../controller';

describe( 'redirectTiers()', () => {
	const res = { redirect: jest.fn() };
	const next = () => {};

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when a :tier is present in the path', () => {
		test.each( [
			[ 'en/themes/free', 'free', 'en/themes' ],
			[ 'en/themes/premium', 'premium', 'en/themes' ],

			[ 'en/themes/filter/free/foofilter', 'free', 'en/themes/filter/foofilter' ],
			[ 'en/themes/filter/premium/foofilter', 'premium', 'en/themes/filter/foofilter' ],

			[ 'en/themes/foovertical/free', 'free', 'en/themes/foovertical' ],
			[ 'en/themes/foovertical/premium', 'premium', 'en/themes/foovertical' ],

			[
				'en/themes/foovertical/free/filter/foofilter',
				'free',
				'en/themes/foovertical/filter/foofilter',
			],
			[
				'en/themes/foovertical/premium/filter/foofilter',
				'premium',
				'en/themes/foovertical/filter/foofilter',
			],

			[ '/themes/type/free', 'free', '/themes' ],
			[ '/themes/type/premium', 'premium', '/themes' ],
			[ '/themes/blog.example/type/free', 'free', '/themes/blog.example' ],
			[ '/themes/blog.example/type/premium', 'premium', '/themes/blog.example' ],

			[ '/themes/search/searchquery/type/free', 'free', '/themes/search/searchquery' ],
			[ '/themes/search/searchquery/type/premium', 'premium', '/themes/search/searchquery' ],
			[
				'/themes/blog.example/search/searchquery/type/free',
				'free',
				'/themes/blog.example/search/searchquery',
			],
			[
				'/themes/blog.example/search/searchquery/type/premium',
				'premium',
				'/themes/blog.example/search/searchquery',
			],

			[ '/themes/filter/somefilter/type/free', 'free', '/themes/filter/somefilter' ],
			[ '/themes/filter/somefilter/type/premium', 'premium', '/themes/filter/somefilter' ],
			[
				'/themes/blog.example/filter/somefilter/type/free',
				'free',
				'/themes/blog.example/filter/somefilter',
			],
			[
				'/themes/blog.example/filter/somefilter/type/premium',
				'premium',
				'/themes/blog.example/filter/somefilter',
			],
		] )( '%s', ( originalUrl, tier, redirectTo ) => {
			redirectTiers( { res, originalUrl, params: { tier } }, next );
			expect( res.redirect ).toBeCalledWith( 301, redirectTo );
		} );
	} );

	describe( 'when a :tier is *not* present in the path', () => {
		test.each( [
			[ 'en/themes' ],
			[ 'en/themes/filter/foofilter' ],
			[ '/themes/search/searchquery' ],
			[ '/themes/blog.example/search/searchquery' ],
			[ '/themes/filter/somefilter' ],
			[ '/themes/blog.example/filter/somefilter' ],
		] )( '%s', ( originalUrl ) => {
			redirectTiers( { res, originalUrl, params: { tier: undefined } }, next );
			expect( res.redirect ).not.toHaveBeenCalled();
		} );
	} );
} );
