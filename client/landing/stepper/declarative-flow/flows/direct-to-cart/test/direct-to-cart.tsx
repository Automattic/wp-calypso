/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import directToCart from '../direct-to-cart';

jest.mock( 'calypso/my-sites/checkout/get-thank-you-page-url', () => ( {
	getAllowedExternalRedirectHosts: () => [ 'allowed.example' ],
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );

jest.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( 'plan=business-bundle' ),
} ) );

function setLocation( search: string ): void {
	Object.defineProperty( window, 'location', {
		writable: true,
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

describe( 'direct-to-cart flow — navigation', () => {
	const submitProcessing = ( providedDependencies: Record< string, unknown > ) => {
		const navigate = jest.fn();
		const { submit } = directToCart.useStepNavigation( STEPS.PROCESSING.slug as never, navigate );
		submit?.( { slug: STEPS.PROCESSING.slug, providedDependencies } as never );
		return navigate;
	};

	it.each( [
		[ ProcessingResult.FAILURE, 'processing_failed' ],
		[ ProcessingResult.NO_ACTION, 'processing_no_action' ],
		[ undefined, 'processing_failed' ],
	] )( 'names the cause when processing ends with %s', ( processingResult, errorReason ) => {
		const navigate = submitProcessing( { processingResult } );

		expect( navigate ).toHaveBeenCalledWith( STEPS.ERROR.slug, { errorReason } );
	} );

	it( 'names the cause when processing succeeds without a site', () => {
		const navigate = submitProcessing( { processingResult: ProcessingResult.SUCCESS } );

		expect( navigate ).toHaveBeenCalledWith( STEPS.ERROR.slug, {
			errorReason: 'processing_missing_site',
		} );
	} );
} );
