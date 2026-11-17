import { afterEach, beforeEach, describe, expect, test, type Mock, vi } from 'vitest';
import { SignupPickPlanPage } from '../../../lib/pages/signup/signup-pick-plan-page';
import * as teamcity from '../../../lib/teamcity';
import {
	flushThrottleWrites,
	registerThrottleActionHandler,
	resetThrottleState,
} from '../../../lib/throttle-flags';
import type { Page } from 'playwright';

const VARIABLES = [ 'E2E_THROTTLE_SIGNUP_ACTION', 'THROTTLE_SIGNUP_EXPIRATION' ] as const;

let actionHandler: Mock;
let unregister: () => void;

beforeEach( () => {
	// A flag raised here is raised through the real helpers, which would tag the
	// build running the unit tests and write the ban to its log for every E2E
	// build in the project to read.
	vi.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	vi.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
	actionHandler = vi.fn();
	unregister = registerThrottleActionHandler( actionHandler );
	VARIABLES.forEach( ( name ) => delete process.env[ name ] );
} );

afterEach( async () => {
	unregister();
	await flushThrottleWrites();
	resetThrottleState();
	VARIABLES.forEach( ( name ) => delete process.env[ name ] );
	vi.restoreAllMocks();
} );

/**
 * A page whose `/sites/new` route answers with the given body and status.
 */
function siteCreationPage( body: string, status = 200 ): Page {
	return {
		getByRole: vi.fn( () => undefined ),
		route: vi.fn( async ( _pattern: unknown, handler: ( route: unknown ) => Promise< void > ) => {
			await handler( {
				fetch: async () => ( {
					url: () => 'https://public-api.wordpress.com/rest/v1.1/sites/new?locale=en',
					status: () => status,
					text: async () => body,
					body: async () => Buffer.from( body ),
				} ),
				fulfill: async () => undefined,
			} );
		} ),
	} as unknown as Page;
}

/**
 * The site creation response the page captures, however it ends.
 */
function capture( page: Page ): Promise< unknown > {
	return (
		new SignupPickPlanPage( page ) as unknown as {
			captureNewSiteResponse(): Promise< unknown >;
		}
	 ).captureNewSiteResponse();
}

describe( 'signup throttle actions', () => {
	test( 'site creation acts on a signup ban answered on the response', async () => {
		actionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect( capture( siteCreationPage( '{"error":"throttled"}', 429 ) ) ).rejects.toThrow(
			'policy applied'
		);
		expect( actionHandler ).toHaveBeenCalledWith( 'skip', [ 'signup' ] );
	} );

	test( 'a body that is no ban keeps its own error', async () => {
		await expect( capture( siteCreationPage( '<!DOCTYPE html><html></html>' ) ) ).rejects.toThrow(
			SyntaxError
		);
		expect( actionHandler ).not.toHaveBeenCalled();
	} );

	test( 'a created site is returned with its blog id as a number', async () => {
		const body = JSON.stringify( { body: { blog_details: { blogid: '12345' } } } );

		await expect( capture( siteCreationPage( body ) ) ).resolves.toEqual( {
			blog_details: { blogid: 12345 },
		} );
		expect( actionHandler ).not.toHaveBeenCalled();
	} );
} );
