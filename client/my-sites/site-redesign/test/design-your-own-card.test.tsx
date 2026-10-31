/** @jest-environment jsdom */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import ui from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { fetchEligibility } from '../api';
import { DesignYourOwnCard } from '../design-your-own-card';

jest.mock( '../api', () => ( { fetchEligibility: jest.fn() } ) );
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useResizeObserver: () => jest.fn(),
} ) );

const freeSite = {
	ID: 1,
	URL: 'https://example.wordpress.com',
	jetpack: false,
	plan: { product_id: 1, product_slug: 'free_plan', expired: false },
};

function renderCard( {
	queryClient = new QueryClient(),
	site = freeSite,
	selectedSiteId = 1,
	capabilities = { manage_options: true, edit_theme_options: true },
}: {
	queryClient?: QueryClient;
	site?: Omit< typeof freeSite, 'plan' > & { plan?: typeof freeSite.plan };
	selectedSiteId?: number | null;
	capabilities?: { manage_options: boolean; edit_theme_options: boolean };
} = {} ) {
	return renderWithProvider( <DesignYourOwnCard />, {
		queryClient,
		reducers: { ui },
		initialState: {
			sites: { items: { 1: site } },
			ui: { selectedSiteId },
			currentUser: { capabilities: { 1: capabilities } },
		},
	} );
}

const allowed = { can_preview: true, can_apply: false, reason: null, required_plan: 'personal' };

beforeEach( () => {
	jest.mocked( fetchEligibility ).mockReset().mockResolvedValue( allowed );
} );

test( 'links a Free site to the four-design route without starting an agent', async () => {
	renderCard();
	for ( const name of [ 'Built with the WordPress Agent', 'Design Your Own' ] ) {
		expect( await screen.findByRole( 'link', { name } ) ).toHaveAttribute(
			'href',
			'/site-redesign/example.wordpress.com'
		);
	}
	expect( screen.getByText( 'Available on Personal' ) ).toBeVisible();
} );

test( 'hides the card while the eligibility request is pending', () => {
	jest.mocked( fetchEligibility ).mockReturnValue( new Promise( () => {} ) );
	renderCard();
	expect( fetchEligibility ).toHaveBeenCalledWith( 1 );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test( 'hides the card when the server does not allow a preview', async () => {
	jest
		.mocked( fetchEligibility )
		.mockResolvedValue( { ...allowed, can_preview: false, reason: 'not_permitted' } );
	renderCard();
	await waitFor( () => expect( fetchEligibility ).toHaveBeenCalledTimes( 1 ) );
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test.each( [
	[ '403', { code: 'site_redesign_not_permitted', status: 403 } ],
	[ 'network error', new Error( 'Failed to fetch' ) ],
] )( 'hides the card on a %s without retrying', async ( _, error ) => {
	jest.mocked( fetchEligibility ).mockRejectedValue( error );
	renderCard();
	await waitFor( () => expect( fetchEligibility ).toHaveBeenCalledTimes( 1 ) );
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
	expect( fetchEligibility ).toHaveBeenCalledTimes( 1 );
} );

test( 'hides the card when a refresh of an allowed answer fails', async () => {
	const queryClient = new QueryClient();
	renderCard( { queryClient } );
	expect( await screen.findByRole( 'article' ) ).toBeInTheDocument();
	jest.mocked( fetchEligibility ).mockRejectedValue( { code: 'site_redesign_not_permitted' } );
	await queryClient.refetchQueries( { queryKey: [ 'site-redesign', 'eligibility' ] } );
	await waitFor( () => expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument() );
} );

test.each( [
	[ 'paid', { product_id: 1003, product_slug: 'personal', expired: false } ],
	[ 'unknown', undefined ],
] )( 'hides the card for a %s plan', ( _, plan ) => {
	renderCard( { site: { ...freeSite, plan } } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
	expect( fetchEligibility ).not.toHaveBeenCalled();
} );

test( 'hides the card for a Jetpack site', () => {
	renderCard( { site: { ...freeSite, jetpack: true } } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
	expect( fetchEligibility ).not.toHaveBeenCalled();
} );

test( 'hides the card without a selected site', () => {
	renderCard( { selectedSiteId: null } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
	expect( fetchEligibility ).not.toHaveBeenCalled();
} );

test.each( [ 'manage_options', 'edit_theme_options' ] )(
	'requires %s permission',
	( capability ) => {
		renderCard( {
			capabilities: { manage_options: true, edit_theme_options: true, [ capability ]: false },
		} );
		expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
		expect( fetchEligibility ).not.toHaveBeenCalled();
	}
);
