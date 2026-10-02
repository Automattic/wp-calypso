/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import LaunchSiteStep from '../index';

const mockLaunchSite = jest.fn();
jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	launchSite: ( siteId: number ) => mockLaunchSite( siteId ),
} ) );

let mockQuery: Record< string, string > = {};
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( { get: ( key: string ) => mockQuery[ key ] ?? null } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( { ID: 123, URL: 'https://example.wordpress.com' } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

function renderStep() {
	const submit = jest.fn();
	const queryClient = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	const tree = (
		<QueryClientProvider client={ queryClient }>
			<LaunchSiteStep flow="launch-site" stepName="launch-site" navigation={ { submit } } />
		</QueryClientProvider>
	);

	const { rerender } = render( tree );

	return { submit, rerender: () => rerender( tree ) };
}

describe( 'LaunchSiteStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockQuery = { siteSlug: 'example.wordpress.com' };
	} );

	it( 'launches the site once and submits', async () => {
		mockLaunchSite.mockResolvedValue( {} );
		const { submit } = renderStep();

		expect( screen.getByText( 'Your site will be live shortly.' ) ).toBeVisible();
		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
		expect( mockLaunchSite ).toHaveBeenCalledTimes( 1 );
		expect( mockLaunchSite ).toHaveBeenCalledWith( 123 );
	} );

	it( 'shows the API error and a way back when the launch fails', async () => {
		mockLaunchSite.mockRejectedValue( {
			message: 'You can not launch your site without a paid eCommerce plan.',
		} );
		const { submit } = renderStep();

		expect( await screen.findByText( 'We couldn’t launch your site' ) ).toBeVisible();
		expect(
			screen.getByText( 'You can not launch your site without a paid eCommerce plan.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
		expect( screen.queryByRole( 'button', { name: /back/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /skip/i } ) ).not.toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();
		expect( mockLaunchSite ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not launch again when re-rendered after a failure', async () => {
		mockLaunchSite.mockRejectedValue( { message: 'Nope.' } );
		const { rerender } = renderStep();

		await screen.findByText( 'We couldn’t launch your site' );
		rerender();
		rerender();

		expect( mockLaunchSite ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'sends the user back to where the flow started', async () => {
		mockQuery.back_to = '/sites/example.wordpress.com/settings';
		mockLaunchSite.mockRejectedValue( { message: 'Nope.' } );
		renderStep();

		expect( await screen.findByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com/settings'
		);
	} );

	it( 'sends the user back to wp-admin when the flow started there', async () => {
		mockQuery.ref = 'wp-admin';
		mockLaunchSite.mockRejectedValue( { message: 'Nope.' } );
		renderStep();

		expect( await screen.findByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/wp-admin'
		);
	} );

	it( 'falls back to a generic message when the error has none', async () => {
		mockLaunchSite.mockRejectedValue( {} );
		renderStep();

		expect(
			await screen.findByText( 'Something went wrong and we couldn’t launch your site.' )
		).toBeVisible();
	} );
} );
