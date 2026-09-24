/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import PluginRecommendations from '..';
import { fetchRecommendation } from '../catalog';

let mockSite: { ID: number } | null = null;
jest.mock( '../../../contexts', () => ( {
	useAgentsManagerContext: () => ( { site: mockSite } ),
} ) );
jest.mock( '../catalog', () => ( { fetchRecommendation: jest.fn() } ) );

const picks = [ { slug: 'seo', why: 'Help readers find your site.' } ];
function chat( recommendations = picks ) {
	return (
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<PluginRecommendations picks={ recommendations } />
		</QueryClientProvider>
	);
}
afterEach( () => {
	mockSite = null;
	jest.resetAllMocks();
} );

it( 'shows loading text and explanations, then links to the current site’s plugin details', async () => {
	let resolvePlugin!: ( value: { name: string } ) => void;
	jest.mocked( fetchRecommendation ).mockReturnValue(
		new Promise( ( resolve ) => {
			resolvePlugin = resolve;
		} )
	);
	const { rerender } = render( chat() );
	expect( screen.getByText( picks[ 0 ].why ) ).toBeVisible();
	expect( screen.queryByRole( 'link' ) ).toBeNull();
	resolvePlugin( { name: 'SEO' } );
	expect( await screen.findByRole( 'link', { name: 'View plugin' } ) ).toHaveAttribute(
		'href',
		'https://wordpress.com/plugins/seo'
	);
	mockSite = { ID: 42 };
	rerender( chat() );
	expect( await screen.findByRole( 'link', { name: 'View plugin' } ) ).toHaveAttribute(
		'href',
		'https://wordpress.com/plugins/seo/42'
	);
	rerender( chat( [] ) );
	expect( screen.queryByText( picks[ 0 ].why ) ).toBeNull();
} );
it( 'keeps missing recommendations visible without an install link', async () => {
	jest.mocked( fetchRecommendation ).mockResolvedValue( null );
	render( chat() );
	expect( await screen.findByText( 'This plugin is no longer available.' ) ).toBeVisible();
	expect( screen.queryByRole( 'link' ) ).toBeNull();
} );
it( 'offers retry after a catalog error', async () => {
	jest.mocked( fetchRecommendation ).mockRejectedValue( new Error( 'Offline' ) );
	render( chat() );
	expect( await screen.findByRole( 'button', { name: 'Retry loading plugin' } ) ).toBeVisible();
} );
