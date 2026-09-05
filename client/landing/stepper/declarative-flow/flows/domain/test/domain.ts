/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import domain from '../domain';

const mockSetPendingAction = jest.fn();

jest.mock( '@automattic/components', () => ( {
	MaterialIcon: () => null,
	ExternalLink: () => null,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setPendingAction: mockSetPendingAction } ),
	useSelect: () => ( {} ),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	AddOns: jest.requireActual( '@automattic/data-stores/src/add-ons/constants' ),
} ) );
jest.mock( '@automattic/onboarding', () => ( { DOMAIN_FLOW: 'domain' } ) );
jest.mock( 'calypso/landing/stepper/utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown[] ) => steps,
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		siteSlug: 'example.wordpress.com',
		site: {
			ID: 123,
			plan: { product_slug: 'value_bundle', is_free: false, features: { active: [] } },
		},
	} ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );
jest.mock( 'calypso/lib/wp', () => ( {
	req: { post: jest.fn() },
} ) );
jest.mock( 'calypso/signup/steps/site-picker/site-picker-submit', () => ( {
	siteHasPaidPlan: () => true,
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
jest.mock( 'calypso/state', () => ( { useDispatch: jest.fn(), useSelector: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'onboard' } ) );

const originalLocation = window.location;

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		value: {
			href: 'https://wordpress.com/setup/domain/use-my-domain?siteSlug=example.wordpress.com',
			replace: jest.fn(),
		},
		writable: true,
	} );
} );

afterAll( () => {
	Object.defineProperty( window, 'location', { value: originalLocation } );
} );

beforeEach( () => {
	jest.clearAllMocks();
} );

it( 'registers an error screen for failed processing', async () => {
	const steps = await domain.initialize();
	expect( steps ).toContainEqual( STEPS.ERROR );
} );

it( 'leaves processing after a failed domain mapping without retrying the write', async () => {
	const navigate = jest.fn();
	const { result } = renderHook( () => domain.useStepNavigation( 'use-my-domain', navigate ) );
	await result.current.submit?.( {
		slug: 'use-my-domain',
		providedDependencies: { domainCartItem: { product_slug: 'domain_map', meta: 'example.com' } },
	} );
	expect( navigate ).toHaveBeenCalledWith( 'processing' );
	const error = new Error( 'Mapping failed' );
	jest.mocked( wpcom.req.post ).mockRejectedValueOnce( error );
	await expect( mockSetPendingAction.mock.calls[ 0 ][ 0 ]() ).rejects.toThrow( error );
	await result.current.submit?.( {
		slug: 'processing',
		providedDependencies: { processingResult: ProcessingResult.FAILURE },
	} );
	expect( navigate ).toHaveBeenLastCalledWith( 'error', undefined, true );
	expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
} );

it( 'returns an empty processing visit to domain selection', async () => {
	const navigate = jest.fn();
	const { result } = renderHook( () => domain.useStepNavigation( 'processing', navigate ) );
	await result.current.submit?.( {
		slug: 'processing',
		providedDependencies: { processingResult: ProcessingResult.NO_ACTION },
	} );
	expect( navigate ).toHaveBeenCalledWith( 'domains', undefined, true );
	expect( mockSetPendingAction ).not.toHaveBeenCalled();
} );

it( 'finishes verified ownership without expecting another domain cart item', async () => {
	const navigate = jest.fn();
	const { result } = renderHook( () => domain.useStepNavigation( 'use-my-domain', navigate ) );
	await expect(
		result.current.submit?.( {
			slug: 'use-my-domain',
			providedDependencies: { ownershipVerificationCompleted: true, domain: 'example.com' },
		} )
	).resolves.toBeUndefined();
	expect( window.location.href ).toContain( '/sites/example.wordpress.com/domains' );
	expect( wpcom.req.post ).not.toHaveBeenCalled();
	expect( mockSetPendingAction ).not.toHaveBeenCalled();
} );

it( 'preserves successful mapping redirects', async () => {
	const navigate = jest.fn();
	const { result } = renderHook( () => domain.useStepNavigation( 'processing', navigate ) );
	const redirectTo = 'https://my.wordpress.com/domains/example.com/domain-connection-setup';
	await result.current.submit?.( {
		slug: 'processing',
		providedDependencies: { processingResult: ProcessingResult.SUCCESS, redirectTo },
	} );
	expect( window.location.replace ).toHaveBeenCalledWith( redirectTo );
	expect( navigate ).not.toHaveBeenCalled();
} );
