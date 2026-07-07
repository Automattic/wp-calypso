/**
 * @jest-environment jsdom
 */
import onboarding from '../flows/onboarding/onboarding';
import { renderFlow } from './helpers';

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
} );
