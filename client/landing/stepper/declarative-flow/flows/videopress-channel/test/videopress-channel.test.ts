/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import videoPressChannel, {
	VIDEOPRESS_CHANNEL_THEME,
	getChannelDashboardUrl,
} from '../videopress-channel';

const mockIsEnabled = jest.fn( ( flag: string ) => flag === 'videopress/channel-flow' );
const mockCreateSite = jest.fn();
const mockSetPendingAction = jest.fn();
const mockSetIntent = jest.fn();
let mockFlowState: Record< string, unknown > = {};

jest.mock( '@automattic/calypso-config', () => {
	const fn = Object.assign( ( key: string ) => key, {
		isEnabled: ( flag: string ) => mockIsEnabled( flag ),
	} );
	return { __esModule: true, default: fn };
} );

jest.mock( '@automattic/onboarding', () => ( {
	VIDEOPRESS_CHANNEL_FLOW: 'videopress-channel',
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Onboard: { SiteIntent: { VideoPressChannel: 'videopress-channel' } },
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( { setIntent: mockSetIntent } ),
	useDispatch: () => ( { setPendingAction: mockSetPendingAction } ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	translate: ( text: string ) => text,
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
} ) );

jest.mock( '../../../../hooks/use-create-site-hook', () => ( {
	useCreateSite: () => mockCreateSite,
} ) );

jest.mock( '../../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

jest.mock( '../../../internals/state-manager/store', () => ( {
	useFlowState: () => ( {
		get: ( key: string ) => mockFlowState[ key ],
		set: ( key: string, value: unknown ) => {
			mockFlowState[ key ] = value;
			return value;
		},
	} ),
} ) );

jest.mock( '../../../internals/steps', () => ( {
	STEPS: {
		VIDEOPRESS_CHANNEL_SETUP: { slug: 'channelSetup' },
		PROCESSING: { slug: 'processing' },
		ERROR: { slug: 'error' },
	},
} ) );

const submitFor = (
	step: 'channelSetup' | 'processing',
	providedDependencies: object,
	navigate = jest.fn()
) => {
	const navigation = videoPressChannel.useStepNavigation( step, navigate );
	navigation.submit?.( {
		slug: step,
		providedDependencies,
	} as Parameters< NonNullable< typeof navigation.submit > >[ 0 ] );
	return navigate;
};

describe( 'videopress-channel flow', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		jest.clearAllMocks();
		mockFlowState = {};
		mockIsEnabled.mockImplementation( ( flag: string ) => flag === 'videopress/channel-flow' );
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
		expect( videoPressChannel.name ).toBe( 'videopress-channel' );
		expect( videoPressChannel.isSignupFlow ).toBe( true );
		expect( videoPressChannel.__experimentalUseBuiltinAuth ).toBe( true );
	} );

	it( 'redirects to /setup/onboarding and exposes no steps when the feature flag is off', () => {
		mockIsEnabled.mockReturnValue( false );

		const steps = videoPressChannel.initialize();

		expect( steps ).toEqual( [] );
		expect( window.location.replace ).toHaveBeenCalledWith( '/setup/onboarding' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_videopress_channel_flow_blocked', {
			reason: 'flag_off',
		} );
	} );

	it( 'sets the channel intent and exposes setup → processing → error when the flag is on', () => {
		const steps = videoPressChannel.initialize();

		expect( mockSetIntent ).toHaveBeenCalledWith( 'videopress-channel' );
		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			'channelSetup',
			'processing',
			'error',
		] );
	} );

	it( 'queues site creation with the channel theme and intent, then moves to processing', () => {
		const navigate = submitFor( 'channelSetup', {
			siteTitle: 'Trail Kitchen',
			tagline: 'Camp cooking',
		} );

		expect( mockFlowState.channelSetup ).toEqual( {
			siteTitle: 'Trail Kitchen',
			tagline: 'Camp cooking',
		} );
		expect( mockSetPendingAction ).toHaveBeenCalledTimes( 1 );

		// Run the queued action: it must ask the hook for a channel site.
		mockSetPendingAction.mock.calls[ 0 ][ 0 ]();
		expect( mockCreateSite ).toHaveBeenCalledWith( {
			theme: VIDEOPRESS_CHANNEL_THEME,
			siteIntent: 'videopress-channel',
			siteTitle: 'Trail Kitchen',
		} );
		expect( navigate ).toHaveBeenCalledWith( 'processing', undefined, true );
	} );

	it( 'sends the new owner to the VideoPress dashboard of the channel on success', () => {
		mockFlowState.site = { siteId: 99, siteSlug: 'trailkitchen.wordpress.com' };

		submitFor( 'processing', { processingResult: ProcessingResult.SUCCESS } );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_videopress_channel_created', {
			site_id: 99,
		} );
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://trailkitchen.wordpress.com/wp-admin/admin.php?page=jetpack-videopress'
		);
	} );

	it( 'stays on the processing step when site creation failed', () => {
		mockFlowState.site = undefined;

		submitFor( 'processing', { processingResult: ProcessingResult.FAILURE } );

		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'builds the channel dashboard URL from the site slug', () => {
		expect( getChannelDashboardUrl( 'example.wordpress.com' ) ).toBe(
			'https://example.wordpress.com/wp-admin/admin.php?page=jetpack-videopress'
		);
	} );
} );
