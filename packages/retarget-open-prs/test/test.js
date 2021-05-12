const retargetOpenPrs = require( '../index' );
const { getPulls, retargetPr } = require( '../github' );
const { isHittingRateLimit, warnOfRateLimit, sleepUntilRateLimitOver } = require( '../rate-limit' );

jest.mock( '../github', () => ( {
	getPulls: jest.fn(),
	retargetPr: jest.fn(),
} ) );

jest.mock( '../rate-limit', () => ( {
	isHittingRateLimit: jest.fn(),
	sleepUntilRateLimitOver: jest.fn(),
	warnOfRateLimit: jest.fn(),
} ) );

const makePr = ( number ) => ( { number } );

describe( 'retargetOpenPrs', () => {
	const owner = 'Automattic';
	const name = 'wp-calypso-fake';
	const from = 'main';
	const to = 'trunk';
	const accessToken = '1234abcd';
	const dry = false;
	const waitForRateLimit = false;

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should consume the full list of PRs page by page', async () => {
		retargetPr.mockReturnValue( { rateLimitReset: null, remainingRateLimit: 200 } );

		const pages = [
			[ makePr( 1 ), makePr( 2 ) ],
			[ makePr( 3 ), makePr( 4 ) ],
			[ makePr( 5 ) ],
			[],
		];

		const prs = pages.reduce( ( acc, page ) => [ ...acc, ...page ], [] );

		pages.forEach( ( page ) => {
			getPulls.mockReturnValueOnce( page );
		} );

		await retargetOpenPrs( owner, name, from, to, accessToken, { dry, waitForRateLimit } );

		prs.forEach( ( pr, index ) => {
			expect( retargetPr ).toHaveBeenNthCalledWith(
				index + 1,
				expect.anything() /* octokit */,
				owner,
				name,
				pr,
				to
			);
		} );
	} );

	describe( 'rate limiting', () => {
		it( 'should wait until the rate limit reset is reached', async () => {
			retargetPr.mockReturnValue( { rateLimitReset: null, remainingRateLimit: 200 } );

			const pages = [
				[ makePr( 1 ), makePr( 2 ) ],
				[ makePr( 3 ), makePr( 4 ) ],
				[ makePr( 5 ) ],
				[],
			];

			// hit rate limit on second request
			isHittingRateLimit
				.mockReturnValueOnce( false )
				.mockReturnValueOnce( true )
				.mockReturnValue( false );

			pages.forEach( ( page ) => {
				getPulls.mockReturnValueOnce( page );
			} );

			const prs = pages.reduce( ( acc, page ) => [ ...acc, ...page ], [] );

			sleepUntilRateLimitOver.mockResolvedValue( undefined );
			await retargetOpenPrs( owner, name, from, to, accessToken, { dry, waitForRateLimit: true } );

			expect( sleepUntilRateLimitOver ).toHaveBeenCalledTimes( 1 );

			// still called for each PR despite rate limit hit
			prs.forEach( ( pr, index ) => {
				expect( retargetPr ).toHaveBeenNthCalledWith(
					index + 1,
					expect.anything() /* octokit */,
					owner,
					name,
					pr,
					to
				);
			} );
		} );

		it( 'should exit after the rate limit is hit', async () => {
			retargetPr.mockReturnValue( { rateLimitReset: null, remainingRateLimit: 200 } );

			const pages = [
				[ makePr( 1 ), makePr( 2 ) ],
				[ makePr( 3 ), makePr( 4 ) ],
				[ makePr( 5 ) ],
				[],
			];

			// hit rate limit at end of second page
			isHittingRateLimit
				.mockReturnValueOnce( false )
				.mockReturnValueOnce( false )
				.mockReturnValueOnce( false )
				.mockReturnValueOnce( true )
				.mockReturnValue( false );

			pages.forEach( ( page ) => {
				getPulls.mockReturnValueOnce( page );
			} );

			await retargetOpenPrs( owner, name, from, to, accessToken, { dry, waitForRateLimit: false } );

			expect( warnOfRateLimit ).toHaveBeenCalledTimes( 1 );

			// only first and second page is processed because we exited when the rate limit was hit
			[ ...pages[ 0 ], ...pages[ 1 ] ].forEach( ( pr, index ) => {
				expect( retargetPr ).toHaveBeenNthCalledWith(
					index + 1,
					expect.anything() /* octokit */,
					owner,
					name,
					pr,
					to
				);
			} );
		} );
	} );
} );
