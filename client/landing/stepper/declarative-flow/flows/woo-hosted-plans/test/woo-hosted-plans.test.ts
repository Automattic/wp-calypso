/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import wooHostedPlansFlow from '../woo-hosted-plans';

jest.mock( '@automattic/onboarding', () => ( {
	WOO_HOSTED_PLANS_FLOW: 'woo-hosted-plans',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( {
		get: ( key: string ) => {
			if ( key === 'back_to' || key === 'cancel_to' ) {
				return null;
			}
			if ( key === 'siteSlug' ) {
				return 'example.com';
			}
			return null;
		},
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( { ID: 123 } ),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( select: ( store: unknown ) => unknown ) => unknown ) =>
		mapSelect( () => ( {
			getSiteOption: ( siteId: number, option: string ) => {
				if ( siteId === 123 && option === 'admin_url' ) {
					return 'https://example.com/wp-admin/';
				}
				return null;
			},
		} ) ),
	resolveSelect: jest.fn(),
	useDispatch: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
	registerStore: jest.fn(),
	createReduxStore: jest.fn(),
	combineReducers: jest.fn(),
	createRegistry: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	register: jest.fn(),
} ) );

describe( 'woo-hosted-plans flow', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
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

	it( 'uses the site admin url when no back_to is provided', () => {
		const stepsProps = wooHostedPlansFlow.useStepsProps?.();
		stepsProps?.[ STEPS.UNIFIED_PLANS.slug ]?.wrapperProps?.goBack?.();

		expect( window.location.assign ).toHaveBeenCalledWith( 'https://example.com/wp-admin/' );
	} );
} );
