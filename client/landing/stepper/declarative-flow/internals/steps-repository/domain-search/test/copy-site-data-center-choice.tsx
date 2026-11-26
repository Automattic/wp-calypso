/**
 * @vitest-environment jsdom
 */
import { fetchSiteDataCenter } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CopySiteDataCenterChoice from '../copy-site-data-center-choice';

vi.mock( '@automattic/api-core', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/api-core' ) >( '@automattic/api-core' ) ),
	fetchSiteDataCenter: vi.fn(),
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSiteQuery: () => ( { data: { ID: 7 } } ),
} ) );

function renderChoice() {
	return render(
		<QueryClientProvider client={ new QueryClient() }>
			<MemoryRouter initialEntries={ [ '/setup/copy-site/domains?sourceSlug=source.example' ] }>
				<CopySiteDataCenterChoice />
			</MemoryRouter>
		</QueryClientProvider>
	);
}

describe( 'CopySiteDataCenterChoice', () => {
	test( 'offers the data centers with room other than the original site’s', async () => {
		vi.mocked( fetchSiteDataCenter ).mockResolvedValue( {
			current: 'dfw',
			preferred: null,
			recommended: 'ams',
			available: [ 'ams', 'dfw' ],
		} );
		renderChoice();

		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Choose a different data center' } )
		);

		const options = screen.getAllByRole( 'option' ).map( ( option ) => option.textContent );
		expect( options ).toEqual( [
			'Same as the original site: US Central (Dallas-Fort Worth, Texas)',
			'EU West (Amsterdam, Netherlands)',
		] );
	} );

	test( 'offers nothing when the backend can’t say where the site is', async () => {
		vi.mocked( fetchSiteDataCenter ).mockRejectedValue( new Error( 'rest_no_route' ) );
		const { container } = renderChoice();

		await vi.waitFor( () => expect( fetchSiteDataCenter ).toHaveBeenCalledWith( 7 ) );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
