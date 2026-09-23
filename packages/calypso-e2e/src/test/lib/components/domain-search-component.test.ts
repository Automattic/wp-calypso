import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { DomainSearchComponent } from '../../../lib/components/domain-search-component';
import * as teamcity from '../../../lib/teamcity';
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
 */
function searchPage( {
	responses = [],
	titles = [],
}: {
	responses?: Response[];
	titles?: string[];
} ) {
	const searchbox = {
		inputValue: jest.fn( async () => SITE_SLUG ),
		fill: jest.fn( async () => undefined ),
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
} );

describe( 'DomainSearchComponent.search', () => {
	test( 'types the keyword without waiting for the pre-filled search to render', async () => {
		// The typed query used to be dropped while the pre-filled list was loading,
		// so the search waited for it. The domain search no longer drops it.
		const { page, listitem, searchbox } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ KEYWORD }.com` ],
		} );

		await new DomainSearchComponent( page ).search( KEYWORD );

		expect( listitem.waitFor ).not.toHaveBeenCalled();
		expect( searchbox.fill ).toHaveBeenCalledWith( KEYWORD );
	} );

	test( 'does not take the pre-filled search for the keyword', async () => {
		// The site-slug response uses the same path and can still be in flight
		// when the keyword is typed.
		const { page, listitem, reload } = searchPage( {
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
		// throttle the error stands for. The attempt that spent the budget is the
		// one that says what went wrong, so its error has to survive.
		const { page, clock, reload } = searchPage( { responses: [] } );
		const start = Date.now();
		jest.spyOn( Date, 'now' ).mockImplementation( () => start + clock.elapsed );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow(
			`Search for "${ KEYWORD }" exceeded its 60s budget. Last attempt failed with: Timeout 30000ms exceeded.`
		);
		expect( reload ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'names the row the list is stuck on when the budget runs out waiting for it', async () => {
		const { page, listitem, clock, reload } = searchPage( {
			responses: [ suggestionsFor( KEYWORD ) ],
			titles: [ `${ SITE_SLUG }.blog` ],
		} );
		const start = Date.now();
		jest.spyOn( Date, 'now' ).mockImplementation( () => start + clock.elapsed );
		// Each read of the list costs most of the budget, so the first attempt
		// runs out of it between reads rather than between attempts.
		listitem.getAttribute.mockImplementation( async () => {
			clock.elapsed += 59 * 1000;
			return `${ SITE_SLUG }.blog`;
		} );

		await expect( new DomainSearchComponent( page ).search( KEYWORD ) ).rejects.toThrow(
			`Search for "${ KEYWORD }" exceeded its 60s budget. Last attempt failed with: Domain suggestions did not update for "${ KEYWORD }": first suggestion is "${ SITE_SLUG }.blog".`
		);
		expect( reload ).toHaveBeenCalledTimes( 2 );
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
