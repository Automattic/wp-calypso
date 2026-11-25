/**
 * @vitest-environment jsdom
 */
import { type Mock, vi } from 'vitest';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import writeOn, { ANON_DRAFT_STORAGE_KEY, MAX_DRAFT_SIZE } from '../write-on';

const mockIsEnabled = vi.fn( ( flag: string ) => flag === 'calypso/write-on-flow' );

let mockSearch = '';

vi.mock( '@automattic/calypso-config', () => {
	const fn = Object.assign( ( key: string ) => key, {
		isEnabled: ( flag: string ) => mockIsEnabled( flag ),
	} );
	return { __esModule: true, default: fn };
} );

vi.mock( '@automattic/onboarding', () => ( {
	WRITE_ON_FLOW: 'write-on',
} ) );

vi.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: vi.fn() } },
} ) );

vi.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: vi.fn(),
} ) );

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
} ) );

vi.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( mockSearch ),
} ) );

vi.mock( 'calypso/landing/stepper/utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

vi.mock( '../../../internals/steps', () => ( {
	STEPS: {
		SITE_CREATION_STEP: { slug: 'create-site' },
		PROCESSING: { slug: 'processing' },
	},
} ) );

const submitFor = ( step: 'create-site' | 'processing', providedDependencies: object ) => {
	const navigation = writeOn.useStepNavigation( step, vi.fn() );
	return navigation.submit?.( {
		slug: step,
		providedDependencies,
	} as Parameters< NonNullable< typeof navigation.submit > >[ 0 ] );
};

describe( 'write-on flow', () => {
	const wpcomPostMock = wpcom.req.post as Mock;
	const originalLocation = window.location;

	beforeEach( () => {
		vi.clearAllMocks();
		mockSearch = '';
		mockIsEnabled.mockImplementation( ( flag: string ) => flag === 'calypso/write-on-flow' );
		window.localStorage.clear();
		Object.defineProperty( window, 'location', {
			value: { assign: vi.fn(), replace: vi.fn() },
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
		expect( writeOn.name ).toBe( 'write-on' );
		expect( writeOn.isSignupFlow ).toBe( true );
		expect( writeOn.__experimentalUseBuiltinAuth ).toBe( true );
	} );

	it( 'redirects to /setup/onboarding, records a blocked event, and exposes no steps when the feature flag is off', () => {
		mockIsEnabled.mockReturnValue( false );

		const steps = writeOn.initialize();

		expect( steps ).toEqual( [] );
		expect( window.location.replace ).toHaveBeenCalledWith( '/setup/onboarding' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_write_on_flow_blocked', {
			reason: 'flag_off',
		} );
	} );

	it( 'navigates from create-site to processing', async () => {
		const navigate = vi.fn();
		const { submit } = writeOn.useStepNavigation( 'create-site', navigate );

		await submit?.( {
			slug: 'create-site',
			providedDependencies: {},
		} as Parameters< NonNullable< typeof submit > >[ 0 ] );

		expect( navigate ).toHaveBeenCalledWith( 'processing', undefined, true );
	} );

	it( 'POSTs the localStorage draft and redirects to the Write editor on success', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'My title', content: '<p>Body</p>', ts: 1 } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 42 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			'/sites/99/posts/new',
			{ apiVersion: '1.2' },
			{ title: 'My title', content: '<p>Body</p>', status: 'draft' }
		);
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=write&post=42'
		);
		expect( window.localStorage.getItem( ANON_DRAFT_STORAGE_KEY ) ).toBeNull();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_write_on_draft_transfer_succeeded', {
			site_id: 99,
		} );
	} );

	it( 'forwards the source query param into the Write editor redirect', async () => {
		mockSearch = 'source=post_new';
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'My title', content: '<p>Body</p>', ts: 1 } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 42 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=write&post=42&source=post_new'
		);
	} );

	it( 'sanitizes the source query param to match the anon funnel before forwarding', async () => {
		mockSearch = 'source=Post_New%21';
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'My title', content: '<p>Body</p>', ts: 1 } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 42 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=write&post=42&source=post_new'
		);
	} );

	it( 'preserves the localStorage draft, logs to logstash, and lands on the site home when the POST fails', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'Keep me', content: '<p>Body</p>', ts: 1 } )
		);
		wpcomPostMock.mockRejectedValue( new Error( 'boom' ) );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( window.location.assign ).toHaveBeenCalledWith( '/home/example.wordpress.com' );
		expect( window.localStorage.getItem( ANON_DRAFT_STORAGE_KEY ) ).not.toBeNull();
		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feature: 'calypso_client',
				severity: 'error',
				blog_id: 99,
				properties: expect.objectContaining( {
					type: 'write_on_draft_transfer_failed',
					error: 'boom',
				} ),
			} )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_write_on_draft_transfer_failed', {
			site_id: 99,
			error: 'boom',
		} );
	} );

	it( 'truncates the error message on the failed-transfer tracks event', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'Keep me', content: '<p>Body</p>', ts: 1 } )
		);
		const longError = 'x'.repeat( 500 );
		wpcomPostMock.mockRejectedValue( new Error( longError ) );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_write_on_draft_transfer_failed', {
			site_id: 99,
			error: 'x'.repeat( 200 ),
		} );
	} );

	it( 'treats an oversized localStorage payload as no draft at publish time', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 'T', content: 'x'.repeat( MAX_DRAFT_SIZE + 1 ) } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 7 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			'/sites/99/posts/new',
			{ apiVersion: '1.2' },
			{ title: '', content: '', status: 'draft' }
		);
	} );

	it( 'coerces non-string draft fields to empty strings', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 12345, content: '<p>Body</p>' } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 7 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			'/sites/99/posts/new',
			{ apiVersion: '1.2' },
			{ title: '', content: '<p>Body</p>', status: 'draft' }
		);
	} );

	it( 'treats a draft with no string fields as no draft', async () => {
		window.localStorage.setItem(
			ANON_DRAFT_STORAGE_KEY,
			JSON.stringify( { title: 12345, content: [ 'not', 'a', 'string' ] } )
		);
		wpcomPostMock.mockResolvedValue( { ID: 7 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			'/sites/99/posts/new',
			{ apiVersion: '1.2' },
			{ title: '', content: '', status: 'draft' }
		);
	} );

	it( 'sends empty title and content when no localStorage draft exists at publish time', async () => {
		wpcomPostMock.mockResolvedValue( { ID: 7 } );

		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 99,
			siteSlug: 'example.wordpress.com',
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			'/sites/99/posts/new',
			{ apiVersion: '1.2' },
			{ title: '', content: '', status: 'draft' }
		);
	} );

	it( 'does nothing on processing failure', async () => {
		await submitFor( 'processing', {
			processingResult: ProcessingResult.FAILURE,
		} );

		expect( wpcomPostMock ).not.toHaveBeenCalled();
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when processing succeeds without site identifiers', async () => {
		await submitFor( 'processing', {
			processingResult: ProcessingResult.SUCCESS,
		} );

		expect( wpcomPostMock ).not.toHaveBeenCalled();
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );
} );
