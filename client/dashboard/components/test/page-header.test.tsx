/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { PageHeader, PageHeaderOverrideProvider } from '../page-header';

describe( '<PageHeader>', () => {
	test( 'renders the title and description the page passes', () => {
		render( <PageHeader title="Active upgrades" description="View your purchases." /> );

		expect( screen.getByRole( 'heading', { name: 'Active upgrades' } ) ).toBeVisible();
		expect( screen.getByText( 'View your purchases.' ) ).toBeVisible();
	} );

	test( 'replaces the title and description with the host override, keeping the actions', () => {
		render(
			<PageHeaderOverrideProvider title="Purchases" description="Manage your site’s plan.">
				<PageHeader
					title="Active upgrades"
					description="View your purchases."
					actions={ <button>Add</button> }
				/>
			</PageHeaderOverrideProvider>
		);

		expect( screen.getByRole( 'heading', { name: 'Purchases' } ) ).toBeVisible();
		expect( screen.getByText( 'Manage your site’s plan.' ) ).toBeVisible();
		expect( screen.queryByText( 'Active upgrades' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'View your purchases.' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add' } ) ).toBeVisible();
	} );
} );
