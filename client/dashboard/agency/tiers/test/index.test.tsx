/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import AgencyTiers from '../index';
import type { Agency } from '@automattic/api-core';

jest.mock( '../../../app/help-center', () => ( {
	useHelpCenter: () => ( {
		setNavigateToRoute: jest.fn(),
		setShowHelpCenter: jest.fn(),
	} ),
} ) );

function renderTiers() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 5,
		tier: { id: 'emerging-partner', status: 'active' },
		influenced_revenue: 0,
	} as unknown as Agency );

	return render( <AgencyTiers />, { queryClient } );
}

describe( '<AgencyTiers>', () => {
	test( 'does not link to the classic Client Reports from the Tools & Platforms benefit', async () => {
		renderTiers();

		const card = within(
			( await screen.findByRole( 'heading', { name: 'Your essential benefits' } ) ).closest(
				'.components-card'
			) as HTMLElement
		);

		expect( card.getByRole( 'link', { name: 'Manage sites' } ) ).toHaveAttribute(
			'href',
			'/sites'
		);
		expect( card.getByRole( 'link', { name: 'Manage purchase' } ) ).toHaveAttribute(
			'href',
			'/purchases'
		);
		expect( card.queryByText( 'Create Client Reports' ) ).not.toBeInTheDocument();
	} );
} );
