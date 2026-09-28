/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import PageLayout, { PageSubNavProvider } from '../page-layout';

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
} );
