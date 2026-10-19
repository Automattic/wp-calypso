import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { DomainSearchComponent } from '../../../lib/components/domain-search-component';
import * as teamcity from '../../../lib/teamcity';
import {
	raiseFlag,
	registerThrottleActionHandler,
	resetThrottleState,
} from '../../../lib/throttle-flags';
import type { ThrottleActionHandler } from '../../../lib/throttle-flags';
import type { Page, Response } from 'playwright';

const SUGGESTIONS_URL = 'https://public-api.wordpress.com/rest/v1.1/domains/suggestions';
const SITE_SLUG = 'e2eflowtestingatomic2';
const KEYWORD = 'e2eflowtesting1788792390563630';

/** Builds a healthy suggestions response for the given query. */
function suggestionsFor( query: string ): Response {
	return {
		status: () => 200,
		text: async () => '{"suggestions":[]}',
		url: () => `${ SUGGESTIONS_URL }?http_envelope=1&query=${ query }`,
	} as unknown as Response;
}

/**
 * A page whose searchbox is pre-filled as a site flow leaves it, whose network
 * carries the given responses, and whose first row reads the given titles in turn.
 *
 * `waitForResponse` answers with the first carried response that satisfies the
 * predicate, and times out straight away when none does. The last title stands
 * for every read after it, so a single title is a list that never changes.
 * `namePulseLists` work the same way for Name Pulse rows.
 */
function searchPage( {
	prefill = '',
	responses = [],
	titles = [],
	namePulseLists = [],
}: {
	prefill?: string;
	responses?: Response[];
	titles?: string[];
	namePulseLists?: string[][];
} ) {
	const searchbox = {
		inputValue: jest.fn( async () => prefill ),
		fill: jest.fn< ( value: string ) => Promise< void > >( async () => undefined ),
		press: jest.fn( async () => undefined ),
	};
	const remainingTitles = [ ...titles ];
	const listitem = {
		waitFor: jest.fn( async () => undefined ),
		getAttribute: jest.fn( async () =>
			remainingTitles.length > 1 ? ( remainingTitles.shift() as string ) : remainingTitles[ 0 ]
		),
		first: jest.fn(),
	};
	listitem.first.mockReturnValue( listitem );
	const remainingNamePulseLists = [ ...namePulseLists ];
	const namePulseRows = {
		evaluateAll: async () =>
			remainingNamePulseLists.length > 1
				? ( remainingNamePulseLists.shift() as string[] )
				: ( remainingNamePulseLists[ 0 ] ?? [] ),
	};

	// Waiting is what a search spends, so the waits a test does not really make
	// still move a clock it can read back through `Date.now`.
	const clock = { elapsed: 0 };

	const page = {
		getByRole: jest.fn( ( role: string ) => {
			if ( role === 'listitem' ) {
				return listitem;
			}

			return role === 'searchbox' ? searchbox : {};
		} ),
		locator: () => namePulseRows,
		reload: jest.fn( async () => null ),
		waitForTimeout: jest.fn( async ( timeout: number ) => {
			clock.elapsed += timeout;
		} ),
		waitForResponse: jest.fn(
			async ( predicate: ( response: Response ) => boolean, options?: { timeout?: number } ) => {
				const match = responses.find( predicate );

				if ( ! match ) {
					clock.elapsed += options?.timeout ?? 0;
					throw new Error( `Timeout ${ options?.timeout ?? 0 }ms exceeded.` );
				}

				return match;
			}
		),
	};

	return { page: page as unknown as Page, searchbox, listitem, clock, reload: page.reload };
}

beforeEach( () => {
	// Left alone, a recorded throttle would tag the build running the unit tests.
	jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
	delete process.env.THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION;
} );

afterEach( () => {
	jest.restoreAllMocks();
	resetThrottleState();
} );

describe( 'DomainSearchComponent.search', () => {
	test( 'lets the pre-filled search render before typing the keyword', async () => {
		// A site flow searches for the site slug on mount, and a keyword typed
		// before that list renders is dropped: the box keeps the text but no
		// request is made for it.
		const { page, listitem, searchbox } = searchPage( {
			prefill: SITE_SLUG,
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ KEYWORD }.com` ],
		} );

		await new DomainSearchComponent( page ).search( KEYWORD );

		expect( listitem.waitFor ).toHaveBeenCalled();
		expect( searchbox.fill ).toHaveBeenCalledWith( KEYWORD );
	} );

	test( 'types straight away when nothing was searched for yet', async () => {
		const { page, listitem } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ KEYWORD }.com` ],
		} );

		await new DomainSearchComponent( page ).search( KEYWORD );

		expect( listitem.waitFor ).not.toHaveBeenCalled();
	} );

	test( 'does not take the pre-filled search for the keyword', async () => {
		// The site-slug response uses the same path and can still be in flight
		// when the keyword is typed.
		const { page, listitem, reload } = searchPage( {
			prefill: SITE_SLUG,
			responses: [ suggestionsFor( SITE_SLUG ) ],
			titles: [ `${ SITE_SLUG }.blog` ],
		} );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow();
		// Never read the list: the search failed waiting for its own response,
		// rather than on the row that response would have rendered.
		expect( listitem.getAttribute ).not.toHaveBeenCalled();
		expect( reload ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'waits until the first row is a suggestion for the keyword', async () => {
		// The response resolves before React re-renders the list.
		const { page, listitem } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ SITE_SLUG }.blog`, `${ SITE_SLUG }.blog`, `${ KEYWORD }.com` ],
		} );

		await new DomainSearchComponent( page ).search( KEYWORD );

		expect( listitem.getAttribute ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'gives up when the list never shows the keyword', async () => {
		const { page } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ SITE_SLUG }.blog` ],
		} );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow(
			`Domain suggestions did not update for "${ KEYWORD }": first suggestion is "${ SITE_SLUG }.blog".`
		);
	} );

	test( 'gives up while the test still has time to report the failure', async () => {
		// Every wait inside the closure is bounded on its own, and `reloadAndRetry`
		// runs the closure three times: unbounded as a whole, a bad search outlives
		// the 120s test timeout and reports that instead of its own error - or the
		// throttle the error stands for.
		const { page, clock, reload } = searchPage( { responses: [] } );
		const start = Date.now();
		jest.spyOn( Date, 'now' ).mockImplementation( () => start + clock.elapsed );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow(
			`Search for "${ KEYWORD }" exceeded its 60s budget`
		);
		expect( reload ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'answers for a ban met during the search once that ban has lapsed', async () => {
		// The ban lasts as long as the budget does, so one met as the search starts
		// is over by the time the budget is spent.
		const { page, searchbox, clock } = searchPage( { responses: [] } );
		const start = Date.now();
		jest.spyOn( Date, 'now' ).mockImplementation( () => start + clock.elapsed );
		searchbox.inputValue.mockImplementationOnce( async () => {
			void raiseFlag( 'domain-suggestions' );
			return '';
		} );
		const handler = jest.fn< ThrottleActionHandler >();
		registerThrottleActionHandler( handler );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow(
			'exceeded its 60s budget'
		);
		expect( handler ).toHaveBeenCalledWith( 'skip', [ 'domain-suggestions' ] );
	} );

	test( 'takes a Name Pulse list once any of its rows is for the keyword', async () => {
		// The first Name Pulse row can be a related name, not the keyword.
		const { page } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			namePulseLists: [ [ `${ SITE_SLUG }.blog` ], [ 'flowtesting.blog', `${ KEYWORD }.com` ] ],
		} );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).resolves.toBeUndefined();
	} );

	test( 'reads a suggestion title through the punctuation a keyword loses', async () => {
		const keyword = 'e2e-flow-testing';
		const { page } = searchPage( {
			responses: [ suggestionsFor( keyword ) ],
			titles: [ 'e2eflowtesting.blog' ],
		} );

		await expect( new DomainSearchComponent( page ).search( keyword ) ).resolves.toBeUndefined();
	} );
} );

interface FakeNamePulseRow {
	domain: string;
	available: boolean;
	failsToAdd?: boolean;
	inCart?: boolean;
	failed?: boolean;
}

interface FakeQuery {
	domain?: string;
	excluded: string[];
	keyword?: string;
	withAddToCart?: boolean;
	part?: 'remove' | 'error';
}

/**
 * A fake page with Name Pulse rows. Clicking "Add to cart" puts a row in the
 * cart, or marks it failed when `failsToAdd` is set. `onDomainRead` lets a test
 * change the rows between reading the domain and clicking.
 */
function namePulsePage(
	rows: FakeNamePulseRow[],
	{ onDomainRead }: { onDomainRead?: () => void } = {}
) {
	const ADD_TO_CART = Symbol( 'add to cart' );
	const hasAddToCart = ( row: FakeNamePulseRow ) => row.available && ! row.inCart && ! row.failed;
	const matches = ( query: FakeQuery ) =>
		rows.filter(
			( row ) =>
				( ! query.domain || row.domain === query.domain ) &&
				! query.excluded.includes( row.domain ) &&
				( ! query.keyword || row.domain.includes( query.keyword ) ) &&
				( ! query.withAddToCart || hasAddToCart( row ) )
		);
	const inPart = ( query: FakeQuery ) =>
		matches( query ).filter( ( row ) => {
			if ( query.part === 'remove' ) {
				return row.inCart;
			}
			return query.part === 'error' ? row.failed : true;
		} );

	const locatorFor = ( query: FakeQuery ): unknown => ( {
		filter: ( { has }: { has: unknown } ) =>
			locatorFor( { ...query, withAddToCart: query.withAddToCart || has === ADD_TO_CART } ),
		and: ( other: { query: FakeQuery } ) =>
			locatorFor( { ...query, keyword: other.query.keyword ?? query.keyword } ),
		first: () => locatorFor( query ),
		or: ( other: { query: FakeQuery } ) => ( {
			first: () => ( {
				waitFor: async () => {
					if ( ! inPart( query ).length && ! inPart( other.query ).length ) {
						throw new Error( 'locator timeout' );
					}
				},
			} ),
		} ),
		getByRole: ( _role: string, { name }: { name: string } ) =>
			name === 'Remove from cart'
				? locatorFor( { ...query, part: 'remove' } )
				: locatorFor( query ),
		locator: () => locatorFor( { ...query, part: 'error' } ),
		waitFor: async () => {
			if ( ! inPart( query ).length ) {
				throw new Error( 'locator timeout' );
			}
		},
		count: async () => inPart( query ).length,
		getAttribute: async ( name: string ) => {
			if ( name === 'aria-label' ) {
				return 'Couldn’t add to cart';
			}
			const domain = inPart( query )[ 0 ]?.domain ?? null;
			onDomainRead?.();
			return domain;
		},
		click: async () => {
			const row = inPart( query )[ 0 ];
			if ( ! row ) {
				throw new Error( 'locator timeout' );
			}
			row.inCart = ! row.failsToAdd;
			row.failed = !! row.failsToAdd;
		},
		query,
	} );

	const page = {
		getByRole: ( _role: string, { name }: { name: string } ) =>
			name === 'Add to cart'
				? ADD_TO_CART
				: { first: () => ( { waitFor: async () => undefined } ) },
		locator: ( selector: string ) => {
			const excluded = [ ...selector.matchAll( /:not\(\[data-domain="([^"]+)"\]\)/g ) ].map(
				( match ) => match[ 1 ]
			);
			const domain = selector.match( /^\.name-pulse-row\[data-domain="([^"]+)"\]$/ )?.[ 1 ];
			const keyword = selector.match( /^\[data-domain\*="([^"]+)"\]$/ )?.[ 1 ];

			return locatorFor( { domain, excluded, keyword } );
		},
		on: () => undefined,
		off: () => undefined,
		url: () => 'https://example.com/start/domain',
	};

	return { page: page as unknown as Page, rows };
}

/** A component as `search()` leaves it after searching for `label`. */
function searchedFor( page: Page, label: string ) {
	const component = new DomainSearchComponent( page );
	component[ 'searchedLabel' ] = label;
	return component;
}

describe( 'DomainSearchComponent.selectFirstSuggestion on Name Pulse', () => {
	const LABEL = 'e2eflowtesting1788792390563630';

	test( 'prefers a row for the keyword over an earlier unrelated one', async () => {
		const { page, rows } = namePulsePage( [
			{ domain: 'flowtesting.blog', available: true },
			{ domain: `${ LABEL }.blog`, available: true },
		] );

		await expect( searchedFor( page, LABEL ).selectFirstSuggestion() ).resolves.toBe(
			`${ LABEL }.blog`
		);
		expect( rows[ 0 ].inCart ).toBeFalsy();
	} );

	test( 'moves on to the next row when adding one fails', async () => {
		const { page, rows } = namePulsePage( [
			{ domain: `${ LABEL }.com`, available: true, failsToAdd: true },
			{ domain: `${ LABEL }.blog`, available: true },
		] );

		await expect( searchedFor( page, LABEL ).selectFirstSuggestion() ).resolves.toBe(
			`${ LABEL }.blog`
		);
		expect( rows[ 0 ].failed ).toBe( true );
	} );

	test( 'adds the domain it returns when an earlier row becomes available', async () => {
		const { page, rows } = namePulsePage(
			[
				{ domain: `${ LABEL }.com`, available: false },
				{ domain: `${ LABEL }.blog`, available: true },
			],
			{
				onDomainRead: () => {
					rows[ 0 ].available = true;
				},
			}
		);

		await expect( searchedFor( page, LABEL ).selectFirstSuggestion() ).resolves.toBe(
			`${ LABEL }.blog`
		);
		expect( rows[ 1 ].inCart ).toBe( true );
		expect( rows[ 0 ].inCart ).toBeFalsy();
	} );
} );
