/** @jest-environment jsdom */
import { isEnabled } from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import ui from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { DesignYourOwnCard } from '../design-your-own-card';

jest.mock( '@automattic/calypso-config', () => ( {
	...jest.requireActual( '@automattic/calypso-config' ),
	__esModule: true,
	default: jest.requireActual( '@automattic/calypso-config' ),
	isEnabled: jest.fn(),
} ) );
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
	site = freeSite,
	selectedSiteId = 1,
	capabilities = { manage_options: true, edit_theme_options: true },
}: {
	site?: Omit< typeof freeSite, 'plan' > & { plan?: typeof freeSite.plan };
	selectedSiteId?: number | null;
	capabilities?: { manage_options: boolean; edit_theme_options: boolean };
} = {} ) {
	return renderWithProvider( <DesignYourOwnCard />, {
		reducers: { ui },
		initialState: {
			sites: { items: { 1: site } },
			ui: { selectedSiteId },
			currentUser: { capabilities: { 1: capabilities } },
		},
	} );
}

beforeEach( () => {
	jest.mocked( isEnabled ).mockImplementation( ( flag ) => flag === 'themes/site-redesign' );
} );

test( 'links a Free site to the four-design route without starting an agent', () => {
	renderCard();
	for ( const name of [ 'Built with the WordPress Agent', 'Design Your Own' ] ) {
		expect( screen.getByRole( 'link', { name } ) ).toHaveAttribute(
			'href',
			'/site-redesign/example.wordpress.com'
		);
	}
	expect( screen.getByText( 'Available on Personal' ) ).toBeVisible();
} );

test( 'hides the card when the feature flag is disabled', () => {
	jest.mocked( isEnabled ).mockReturnValue( false );
	renderCard();
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test.each( [
	[ 'paid', { product_id: 1003, product_slug: 'personal', expired: false } ],
	[ 'unknown', undefined ],
] )( 'hides the card for a %s plan', ( _, plan ) => {
	renderCard( { site: { ...freeSite, plan } } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test( 'hides the card for a Jetpack site', () => {
	renderCard( { site: { ...freeSite, jetpack: true } } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test( 'hides the card without a selected site', () => {
	renderCard( { selectedSiteId: null } );
	expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
} );

test.each( [ 'manage_options', 'edit_theme_options' ] )(
	'requires %s permission',
	( capability ) => {
		renderCard( {
			capabilities: { manage_options: true, edit_theme_options: true, [ capability ]: false },
		} );
		expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
	}
);
