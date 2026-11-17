/**
 * @jest-environment jsdom
 */
import onboarding from '../flows/onboarding/onboarding';
import { renderFlow } from './helpers';

// Only the plans-page experiment still uses ExPlat here; stub it so the flow's unconditional
// loadExperimentAssignment side effect never hits a real network fetch.
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn( () => Promise.resolve( { variationName: null } ) ),
} ) );

let mockSiteOptions: Record< string, unknown > = {};
// A lazy Proxy, not a spread of requireActual: eagerly spreading '@wordpress/data' here recurses
// into its own mock factory while the module is still initializing (via @wordpress/rich-text's
// store, which the flow pulls in transitively) and crashes before any test runs.
jest.mock( '@wordpress/data', () => {
	const actualModule = jest.requireActual( '@wordpress/data' );

	return new Proxy( actualModule, {
		get: ( target, property ) => {
			if ( property === 'resolveSelect' ) {
				return () => ( {
					getSite: async () => ( {
						options: { admin_url: 'https://example.wordpress.com/wp-admin/', ...mockSiteOptions },
					} ),
				} );
			}
			return target[ property as keyof typeof target ];
		},
	} );
} );

const originalLocation = window.location;
const tick = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'Onboarding flow: setup-your-site-ai pre-made and AI tool destinations', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				assign: jest.fn(),
				replace: jest.fn(),
				pathname: '/setup/onboarding',
				search: '',
				href: 'http://wordpress.com/setup/onboarding',
			},
			writable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
		mockSiteOptions = {};
	} );

	it( 'sends the manual-setup (blank-site) choice to My Home', async () => {
		const { runUseStepNavigationSubmit } = renderFlow( onboarding );

		await runUseStepNavigationSubmit( {
			currentStep: 'setup-your-site-ai',
			dependencies: { setupChoice: 'blank-site', siteSlug: 'example.wordpress.com' },
		} );
		await tick();

		expect( window.location.assign ).toHaveBeenCalledWith( '/home/example.wordpress.com' );
	} );

	it( 'sends the blank-site choice to Site Setup on AI Launchpad sites', async () => {
		mockSiteOptions = { wpcom_ai_launchpad_enabled: true };
		const { runUseStepNavigationSubmit } = renderFlow( onboarding );

		await runUseStepNavigationSubmit( {
			currentStep: 'setup-your-site-ai',
			dependencies: { setupChoice: 'blank-site', siteSlug: 'example.wordpress.com' },
		} );
		await tick();

		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=site-setup-wp-admin'
		);
	} );

	it( 'sends the ai-tool choice to the AI tool start of Site Setup', async () => {
		mockSiteOptions = { wpcom_ai_launchpad_enabled: true };
		const { runUseStepNavigationSubmit } = renderFlow( onboarding );

		await runUseStepNavigationSubmit( {
			currentStep: 'setup-your-site-ai',
			dependencies: { setupChoice: 'ai-tool', siteSlug: 'example.wordpress.com' },
		} );
		await tick();

		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=site-setup-wp-admin&start=ai-tool'
		);
	} );

	it.each( [
		[ 'without the AI Launchpad', {}, '/home/example.wordpress.com' ],
		// Jetpack forwards a completed Site Setup to the Dashboard.
		[
			'with a completed AI Launchpad',
			{ wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_completed: true },
			'https://example.wordpress.com/wp-admin/admin.php?page=site-setup-wp-admin',
		],
		[
			'with no guidance',
			{ wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_no_guidance: true },
			'https://example.wordpress.com/wp-admin/',
		],
	] )(
		'sends the ai-tool choice where blank-site goes on a site %s',
		async ( _, options, destination ) => {
			mockSiteOptions = options;
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: 'setup-your-site-ai',
				dependencies: { setupChoice: 'ai-tool', siteSlug: 'example.wordpress.com' },
			} );
			await tick();

			expect( window.location.assign ).toHaveBeenCalledWith( destination );
		}
	);
} );
