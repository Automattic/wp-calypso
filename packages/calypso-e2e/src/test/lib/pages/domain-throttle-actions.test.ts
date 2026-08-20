import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { DomainSearchComponent } from '../../../lib/components/domain-search-component';
import { UseADomainIOwnPage } from '../../../lib/pages/use-a-domain-i-own-page';
import * as teamcity from '../../../lib/teamcity';
import {
	flushThrottleWrites,
	registerThrottleActionHandler,
	resetThrottleState,
} from '../../../lib/throttle-flags';
import type { Page } from 'playwright';

const ACTION_VARIABLES = [
	'E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION',
	'E2E_THROTTLE_DOMAIN_AVAILABILITY_ACTION',
] as const;
const EXPIRATION_VARIABLES = [
	'THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION',
	'THROTTLE_DOMAIN_AVAILABILITY_EXPIRATION',
] as const;

let actionHandler: jest.Mock;
let unregister: () => void;

beforeEach( () => {
	// These tests raise flags through the real helpers. Left alone, the helpers
	// tag the build running the unit tests and write the ban to its log, and
	// every E2E build in the project reads that for the next six hours.
	jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
	actionHandler = jest.fn();
	unregister = registerThrottleActionHandler( actionHandler );
	[ ...ACTION_VARIABLES, ...EXPIRATION_VARIABLES ].forEach( ( name ) => {
		delete process.env[ name ];
	} );
} );

afterEach( async () => {
	unregister();
	await flushThrottleWrites();
	resetThrottleState();
	[ ...ACTION_VARIABLES, ...EXPIRATION_VARIABLES ].forEach( ( name ) => {
		delete process.env[ name ];
	} );
	jest.restoreAllMocks();
} );

/** Builds the response shape used by the domain helpers. */
function response( url: string, body: string, status = 200 ) {
	return {
		status: () => status,
		text: async () => body,
		url: () => url,
	};
}

/** A page whose "Bring it over" button never appears. */
function bringItOverPage(): Page {
	const button = {
		click: jest.fn( async () => {
			throw new Error( 'locator timeout' );
		} ),
	};
	return { getByRole: jest.fn( () => button ) } as unknown as Page;
}

/** A page whose first suggestion row never appears. */
function suggestionRowPage(): Page {
	const row = {
		waitFor: jest.fn( async () => {
			throw new Error( 'locator timeout' );
		} ),
	};
	const listitem = { first: jest.fn( () => row ) };
	return { getByRole: jest.fn( () => listitem ) } as unknown as Page;
}

describe( 'domain throttle actions', () => {
	test( 'domain availability acts before sending a request for a known throttle', async () => {
		const waitForResponse = jest.fn();
		const page = {
			locator: jest.fn(),
			waitForResponse,
		} as unknown as Page;
		process.env.THROTTLE_DOMAIN_AVAILABILITY_EXPIRATION = String( Date.now() + 60_000 );
		actionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect(
			new UseADomainIOwnPage( page ).fillUseDomainIOwnInput( 'example.com' )
		).rejects.toThrow( 'policy applied' );
		expect( waitForResponse ).not.toHaveBeenCalled();
	} );

	test( 'domain availability records a new throttle and acts on the same call', async () => {
		const input = {
			fill: jest.fn( async () => undefined ),
			press: jest.fn( async () => undefined ),
		};
		const page = {
			locator: jest.fn( () => input ),
			waitForResponse: jest.fn( async () =>
				response(
					'https://public-api.wordpress.com/rest/v1.3/domains/example.com/is-available',
					'{"error":"domain_availability_throttle"}',
					429
				)
			),
		} as unknown as Page;

		await new UseADomainIOwnPage( page ).fillUseDomainIOwnInput( 'example.com' );
		expect( actionHandler ).toHaveBeenCalledWith( 'skip', [ 'domain-availability' ] );
	} );

	test( 'an expired suggestions signal leaves the search unchanged', async () => {
		const listitem = {
			count: jest.fn( async () => 0 ),
			first: jest.fn(),
		};
		listitem.first.mockReturnValue( listitem );
		const searchbox = {
			fill: jest.fn( async () => undefined ),
			press: jest.fn( async () => undefined ),
		};
		const heading = {};
		const page = {
			getByRole: jest.fn( ( role: string ) => {
				if ( role === 'listitem' ) {
					return listitem;
				}
				return role === 'searchbox' ? searchbox : heading;
			} ),
			reload: jest.fn(),
			waitForResponse: jest.fn( async () =>
				response(
					'https://public-api.wordpress.com/rest/v1.1/domains/suggestions?query=example',
					'{"suggestions":[]}'
				)
			),
		} as unknown as Page;
		process.env.THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION = String( Date.now() - 1 );

		await new DomainSearchComponent( page ).search( 'example' );
		expect( searchbox.press ).toHaveBeenCalledWith( 'Enter' );
		expect( actionHandler ).not.toHaveBeenCalled();
	} );

	test( 'domain suggestions record a throttled search without acting on it', async () => {
		const listitem = {
			count: jest.fn( async () => 0 ),
			first: jest.fn(),
		};
		listitem.first.mockReturnValue( listitem );
		const searchbox = {
			fill: jest.fn( async () => undefined ),
			press: jest.fn( async () => undefined ),
		};
		const page = {
			getByRole: jest.fn( ( role: string ) => {
				if ( role === 'listitem' ) {
					return listitem;
				}
				return role === 'searchbox' ? searchbox : {};
			} ),
			reload: jest.fn(),
			waitForResponse: jest.fn( async () =>
				response(
					'https://public-api.wordpress.com/rest/v1.1/domains/suggestions?query=example',
					'{"error":"domain_suggestions_throttled"}',
					403
				)
			),
		} as unknown as Page;

		await new DomainSearchComponent( page ).search( 'example' );
		// The search came back, so the caller that needed the list is the one to
		// meet the ban. Recording is all that happens here.
		expect( process.env.THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION ).toBeDefined();
		expect( actionHandler ).not.toHaveBeenCalled();
	} );

	test( 'domain suggestions act when the list never renders under a ban', async () => {
		const page = suggestionRowPage();
		process.env.THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION = String( Date.now() + 60_000 );
		actionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect( new DomainSearchComponent( page ).selectFirstSuggestion() ).rejects.toThrow(
			'policy applied'
		);
	} );

	test( 'adding to the cart acts on an availability ban before waiting on the row', async () => {
		// Add to cart checks availability first, so the ban is answered in the
		// browser and the button sticks in its error state: acting has to come
		// before the wait, or the test spends its whole timeout on a lost cause.
		const page = suggestionRowPage();
		process.env.THROTTLE_DOMAIN_AVAILABILITY_EXPIRATION = String( Date.now() + 60_000 );
		actionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect( new DomainSearchComponent( page ).selectFirstSuggestion() ).rejects.toThrow(
			'policy applied'
		);
		expect( actionHandler ).toHaveBeenCalledWith( 'skip', [ 'domain-availability' ] );
	} );

	test( 'the "Bring it over" button acts on an availability ban when it never renders', async () => {
		// The button is rendered off the availability query, so a ban leaves it
		// absent and the click times out on a test that should have skipped.
		const page = bringItOverPage();
		process.env.THROTTLE_DOMAIN_AVAILABILITY_EXPIRATION = String( Date.now() + 60_000 );
		actionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect( new DomainSearchComponent( page ).clickBringItOver() ).rejects.toThrow(
			'policy applied'
		);
		expect( actionHandler ).toHaveBeenCalledWith( 'skip', [ 'domain-availability' ] );
	} );

	test( 'a "Bring it over" button that never appears keeps its own error when no ban is in force', async () => {
		const page = bringItOverPage();

		await expect( new DomainSearchComponent( page ).clickBringItOver() ).rejects.toThrow(
			'locator timeout'
		);
		expect( actionHandler ).not.toHaveBeenCalled();
	} );

	test( 'a suggestion row that never appears keeps its own error when no ban is in force', async () => {
		const page = suggestionRowPage();

		await expect( new DomainSearchComponent( page ).selectFirstSuggestion() ).rejects.toThrow(
			'locator timeout'
		);
		expect( actionHandler ).not.toHaveBeenCalled();
	} );
} );
