/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import WooPaymentsDetails from '../woopayments-details';

const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();

jest.mock( '../../../../app/help-center', () => ( {
	useHelpCenter: () => ( {
		setShowHelpCenter: mockSetShowHelpCenter,
		setNavigateToRoute: mockSetNavigateToRoute,
	} ),
} ) );

describe( '<WooPaymentsDetails>', () => {
	test( 'opens the revenue share guide in the Help Center and records the click', async () => {
		const { recordTracksEvent } = render( <WooPaymentsDetails /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Learn more' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_marketplace_products_overview_woopayments_learn_more_revenue_share_click'
		);
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith(
			'/post?link=' +
				encodeURIComponent(
					'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/'
				)
		);
	} );

	test( 'links to the full terms and records the click', async () => {
		const { recordTracksEvent } = render( <WooPaymentsDetails /> );

		const link = await screen.findByRole( 'link', { name: /View full terms/ } );
		expect( link ).toHaveAttribute(
			'href',
			'https://automattic.com/for-agencies/program-incentives/'
		);

		await userEvent.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_marketplace_products_overview_woopayments_view_full_terms_click'
		);
	} );
} );
