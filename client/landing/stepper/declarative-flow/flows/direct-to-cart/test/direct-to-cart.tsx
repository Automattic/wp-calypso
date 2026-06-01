/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import directToCart from '../direct-to-cart';
import { writeResumeRecord } from '../resume-storage';

jest.mock( 'calypso/my-sites/checkout/get-thank-you-page-url', () => ( {
	getAllowedExternalRedirectHosts: () => [ 'allowed.example' ],
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

jest.mock( '../resume-storage', () => ( {
	resumeKey: jest.fn(
		( integration, contextId ) => `key:${ integration ?? '' }:${ contextId ?? '' }`
	),
	writeResumeRecord: jest.fn(),
	readResumeRecord: jest.fn(),
	clearResumeRecord: jest.fn(),
} ) );

function setLocation( search: string ): void {
	Object.defineProperty( window, 'location', {
		writable: true,
		configurable: true,
		value: new URL( `https://wordpress.com/setup/direct-to-cart${ search }` ),
	} );
}

describe( 'direct-to-cart flow — initialize', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'routes to the shared error step when no plan is provided', async () => {
		setLocation( '' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toEqual( [ 'error' ] );
	} );

	it( 'routes to the shared error step when plan is non-atomic', async () => {
		setLocation( '?plan=personal-bundle' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toEqual( [ 'error' ] );
	} );

	it( 'returns the full step list for a valid atomic-triggering plan', async () => {
		setLocation( '?plan=business-bundle' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toContain( 'create-site' );
		expect( slugs ).toContain( 'processing' );
		expect( slugs ).toContain( 'error' );
	} );

	it( 'accepts ecommerce-bundle-2y', async () => {
		setLocation( '?plan=ecommerce-bundle-2y' );
		const steps = await ( directToCart.initialize as () => Promise< Array< { slug: string } > > )();
		const slugs = steps.map( ( s ) => s.slug );
		expect( slugs ).toContain( 'create-site' );
	} );
} );

/**
 * Minimal harness for driving `flow.useStepNavigation()`'s submit handler.
 * Avoids `renderFlow` from ../../../test/helpers because that pulls in the
 * themes reducer + redux Provider, which we don't need — the submit handler
 * only depends on MemoryRouter (for `useQuery` → `useLocation`).
 */
function submitProcessing( {
	currentURL,
	dependencies,
}: {
	currentURL: string;
	dependencies: Record< string, unknown >;
} ): void {
	const Harness = () => {
		const navigate = useNavigate();
		const fakeNavigate = ( pathname: string ) => navigate( pathname );
		const { submit } = directToCart.useStepNavigation(
			STEPS.PROCESSING.slug,
			fakeNavigate as unknown as Parameters< typeof directToCart.useStepNavigation >[ 1 ]
		);
		useEffect( () => {
			submit?.( {
				slug: STEPS.PROCESSING.slug,
				providedDependencies: dependencies,
			} as Parameters< NonNullable< typeof submit > >[ 0 ] );
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );
		return null;
	};

	render(
		<MemoryRouter initialEntries={ [ currentURL ] }>
			<Harness />
		</MemoryRouter>
	);
}

describe( 'direct-to-cart flow — useStepNavigation submit (PROCESSING)', () => {
	const originalLocation = window.location;
	let replaceMock: jest.Mock;

	beforeEach( () => {
		replaceMock = jest.fn();
		Object.defineProperty( window, 'location', {
			writable: true,
			configurable: true,
			value: { ...originalLocation, replace: replaceMock },
		} );
		( persistSignupDestination as jest.Mock ).mockClear();
		( setSignupCompleteFlowName as jest.Mock ).mockClear();
		( setSignupCompleteSlug as jest.Mock ).mockClear();
		( setSignupCompleteSiteID as jest.Mock ).mockClear();
		( recordTracksEvent as jest.Mock ).mockClear();
		( logToLogstash as jest.Mock ).mockClear();
		( writeResumeRecord as jest.Mock ).mockClear();
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			configurable: true,
			value: originalLocation,
		} );
	} );

	it( 'persists a transferring destination that initiates the atomic transfer (drift-guard regression)', () => {
		submitProcessing( {
			currentURL: `/setup/direct-to-cart/${
				STEPS.PROCESSING.slug
			}?plan=business-bundle&redirect_to=${ encodeURIComponent(
				'https://allowed.example/return'
			) }&coupon=SAVE20`,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteSlug: 'example.wordpress.com',
				siteId: 12345,
			},
		} );

		// The bug being guarded: persistSignupDestination was previously passed
		// a hand-rolled URL missing siteId/siteSlug and — crucially —
		// initiate_transfer_context. Without that param, WAIT_FOR_ATOMIC never
		// initiates the transfer and polls /atomic/transfers/latest forever.
		expect( persistSignupDestination ).toHaveBeenCalledTimes( 1 );
		const persisted = ( persistSignupDestination as jest.Mock ).mock.calls[ 0 ][ 0 ];
		const persistedParsed = new URL( persisted, 'https://wordpress.com' );
		expect( persistedParsed.pathname ).toBe( '/setup/transferring-hosted-site' );
		expect( persistedParsed.searchParams.get( 'initiate_transfer_context' ) ).toBe( 'hosting' );
		expect( persistedParsed.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( persistedParsed.searchParams.get( 'siteId' ) ).toBe( '12345' );
		expect( persistedParsed.searchParams.get( 'redirect_to' ) ).toContain(
			'allowed.example/return'
		);
		expect( persistedParsed.searchParams.get( 'redirect_to' ) ).toContain( 'wpcom_purchase=1' );

		// Sibling signup-state writes the post-checkout machinery expects.
		expect( setSignupCompleteFlowName ).toHaveBeenCalledWith( 'direct-to-cart' );
		expect( setSignupCompleteSlug ).toHaveBeenCalledWith( 'example.wordpress.com' );
		expect( setSignupCompleteSiteID ).toHaveBeenCalledWith( 12345 );

		// The chained checkout URL navigated to.
		expect( replaceMock ).toHaveBeenCalledTimes( 1 );
		const checkoutUrl = replaceMock.mock.calls[ 0 ][ 0 ];
		expect( checkoutUrl ).toContain( '/checkout/business-bundle/example.wordpress.com' );
		expect( checkoutUrl ).toContain( 'coupon=SAVE20' );

		// Drift guard: redirect_to embedded in checkout MUST equal what we
		// persisted. The fix's whole point is that they can't drift.
		const checkoutParsed = new URL( checkoutUrl, 'https://wordpress.com' );
		expect( checkoutParsed.searchParams.get( 'redirect_to' ) ).toBe( persisted );

		// Resume record written so a revisit can short-circuit.
		expect( writeResumeRecord ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'persists /home/<slug> when no external redirect is provided', () => {
		submitProcessing( {
			currentURL: `/setup/direct-to-cart/${ STEPS.PROCESSING.slug }?plan=business-bundle`,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteSlug: 'example.wordpress.com',
				siteId: 12345,
			},
		} );

		expect( persistSignupDestination ).toHaveBeenCalledWith( '/home/example.wordpress.com' );

		// Same fallback should appear as the checkout redirect_to.
		const checkoutUrl = replaceMock.mock.calls[ 0 ][ 0 ];
		const checkoutParsed = new URL( checkoutUrl, 'https://wordpress.com' );
		expect( checkoutParsed.searchParams.get( 'redirect_to' ) ).toBe(
			'/home/example.wordpress.com'
		);
	} );

	it( 'omits setSignupCompleteSiteID when siteId is missing', () => {
		submitProcessing( {
			currentURL: `/setup/direct-to-cart/${ STEPS.PROCESSING.slug }?plan=business-bundle`,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteSlug: 'example.wordpress.com',
			},
		} );

		expect( setSignupCompleteSlug ).toHaveBeenCalledWith( 'example.wordpress.com' );
		expect( setSignupCompleteSiteID ).not.toHaveBeenCalled();
	} );

	it( 'skips persistence and navigation when processing failed', () => {
		submitProcessing( {
			currentURL: `/setup/direct-to-cart/${ STEPS.PROCESSING.slug }?plan=business-bundle`,
			dependencies: {
				processingResult: ProcessingResult.FAILURE,
				siteSlug: 'example.wordpress.com',
				siteId: 12345,
			},
		} );

		expect( persistSignupDestination ).not.toHaveBeenCalled();
		expect( replaceMock ).not.toHaveBeenCalled();
		expect( writeResumeRecord ).not.toHaveBeenCalled();
	} );

	it( 'records tracks + logstash and skips navigation when siteSlug is missing', () => {
		submitProcessing( {
			currentURL: `/setup/direct-to-cart/${ STEPS.PROCESSING.slug }?plan=business-bundle`,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				// siteSlug intentionally omitted
				siteId: 12345,
			},
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_direct_to_cart_missing_site_slug',
			{}
		);
		expect( logToLogstash ).toHaveBeenCalledTimes( 1 );
		const logArg = ( logToLogstash as jest.Mock ).mock.calls[ 0 ][ 0 ];
		expect( logArg ).toMatchObject( {
			feature: 'calypso_client',
			severity: 'error',
			tags: expect.arrayContaining( [ 'direct_to_cart' ] ),
		} );

		expect( persistSignupDestination ).not.toHaveBeenCalled();
		expect( replaceMock ).not.toHaveBeenCalled();
	} );
} );
