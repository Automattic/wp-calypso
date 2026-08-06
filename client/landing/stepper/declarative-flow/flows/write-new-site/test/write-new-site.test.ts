/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import writeNewSite from '../write-new-site';

jest.mock( '@automattic/onboarding', () => ( {
	WRITE_NEW_SITE_FLOW: 'write-new-site',
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

jest.mock( '../../../internals/steps', () => ( {
	STEPS: {
		SITE_CREATION_STEP: { slug: 'create-site' },
		PROCESSING: { slug: 'processing' },
	},
} ) );

const submitFor = ( step: 'create-site' | 'processing', providedDependencies: object ) => {
	const navigate = jest.fn();
	const navigation = writeNewSite.useStepNavigation( step, navigate );
	const result = navigation.submit?.( {
		slug: step,
		providedDependencies,
	} as Parameters< NonNullable< typeof navigation.submit > >[ 0 ] );
	return { navigate, result };
};

describe( 'write-new-site flow', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		jest.clearAllMocks();
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn(), replace: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	it( 'is registered as a signup flow with built-in auth', () => {
		expect( writeNewSite.name ).toBe( 'write-new-site' );
		expect( writeNewSite.isSignupFlow ).toBe( true );
		expect( writeNewSite.__experimentalUseBuiltinAuth ).toBe( true );
	} );

	it( 'exposes the create-site and processing steps', () => {
		expect( writeNewSite.initialize() ).toEqual( [
			{ slug: 'create-site' },
			{ slug: 'processing' },
		] );
	} );

	it( 'navigates from create-site to processing', async () => {
		const { navigate } = submitFor( 'create-site', {} );
		expect( navigate ).toHaveBeenCalledWith( 'processing', undefined, true );
	} );

	it( 'redirects to the Write editor and records a tracks event on success', async () => {
		const { result } = submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );
		await result;

		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=write'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_write_new_site_flow_site_created', {
			site_id: 99,
		} );
	} );

	it( 'does nothing on processing failure', async () => {
		const { result } = submitFor( 'processing', {
			processingResult: ProcessingResult.FAILURE,
		} );
		await result;

		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when processing succeeds without a site slug', async () => {
		const { result } = submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
		} );
		await result;

		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
