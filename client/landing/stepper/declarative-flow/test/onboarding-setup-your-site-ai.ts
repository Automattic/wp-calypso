/**
 * @jest-environment jsdom
 */
import onboarding from '../flows/onboarding/onboarding';
import { renderFlow } from './helpers';

// Only the plans-page experiment still uses ExPlat here; stub it so the flow's unconditional
// loadExperimentAssignment side effect never hits a real network fetch.
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn( () => Promise.resolve( { variationName: null } ) ),
	// A plain function, not jest.fn: a resetAllMocks would wipe a jest.fn's implementation, leaving
	// useExperiment returning undefined (its tuple is destructured in the gate hook).
	useExperiment: () => [ false, null ],
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

describe( 'Onboarding flow: setup-your-site-ai manual setup destination', () => {
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
} );
