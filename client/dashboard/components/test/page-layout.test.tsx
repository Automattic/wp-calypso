/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import PageLayout, { PageNoticesProvider, PageSubNavProvider } from '../page-layout';

describe( '<PageLayout>', () => {
	test( 'renders no host sub-navigation without a provider', () => {
		render( <PageLayout header={ <h1>Active upgrades</h1> }>Content</PageLayout> );

		expect( screen.queryByRole( 'navigation' ) ).not.toBeInTheDocument();
	} );

	test( 'places the host sub-navigation between the header and the content', () => {
		render(
			<PageSubNavProvider subNav={ <nav>Tabs</nav> }>
				<PageLayout header={ <h1>Active upgrades</h1> }>Content</PageLayout>
			</PageSubNavProvider>
		);

		const subNav = screen.getByRole( 'navigation' );
		const header = screen.getByRole( 'heading', { name: 'Active upgrades' } );
		const content = screen.getByText( 'Content' );

		expect( header.compareDocumentPosition( subNav ) ).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
		expect( subNav.compareDocumentPosition( content ) ).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
	} );

	test( 'shows the host notices on a page without notices of its own', () => {
		render(
			<PageNoticesProvider notices={ <p>Host notice</p> }>
				<PageLayout header={ <h1>Overview</h1> }>Content</PageLayout>
			</PageNoticesProvider>
		);

		expect( screen.getByText( 'Host notice' ) ).toBeVisible();
	} );

	test( 'lets a page with its own notices replace the host notices', () => {
		render(
			<PageNoticesProvider notices={ <p>Host notice</p> }>
				<PageLayout header={ <h1>Overview</h1> } notices={ <p>Page notice</p> }>
					Content
				</PageLayout>
			</PageNoticesProvider>
		);

		expect( screen.getByText( 'Page notice' ) ).toBeVisible();
		expect( screen.queryByText( 'Host notice' ) ).not.toBeInTheDocument();
	} );

	test( 'does not repeat the host notices in a nested layout', () => {
		render(
			<PageNoticesProvider notices={ <p>Host notice</p> }>
				<PageLayout header={ <h1>Outer</h1> }>
					<PageLayout header={ <h2>Inner</h2> }>Content</PageLayout>
				</PageLayout>
			</PageNoticesProvider>
		);

		expect( screen.getAllByText( 'Host notice' ) ).toHaveLength( 1 );
	} );
} );
