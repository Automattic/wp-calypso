/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import membershipsReducer from 'calypso/state/memberships/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import CompSubscriptionModal from '../comp-modal';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/memberships/comps/actions', () => ( {
	requestAddComp: jest.fn( () => () => Promise.resolve() ),
} ) );

const products = [
	{
		ID: 100,
		title: 'Monthly Subscription',
		price: 5,
		currency: 'USD',
		renewal_schedule: '1 month',
	},
	{
		ID: 200,
		title: 'Yearly Subscription',
		price: 40,
		currency: 'USD',
		renewal_schedule: '1 year',
	},
];

const siteId = 1;

const initialState = {
	sites: { items: {} },
	ui: { selectedSiteId: siteId },
	memberships: {
		productList: {
			items: {
				[ siteId ]: products,
			},
		},
	},
};

function renderModal( props = {} ) {
	const defaultProps = {
		siteId,
		userId: 123,
		username: 'testuser',
		onClose: jest.fn(),
		onConfirm: jest.fn(),
	};

	return {
		...renderWithProvider( <CompSubscriptionModal { ...defaultProps } { ...props } />, {
			initialState,
			reducers: {
				ui: uiReducer,
				memberships: membershipsReducer,
			},
		} ),
		props: { ...defaultProps, ...props },
	};
}

describe( 'CompSubscriptionModal', () => {
	it( 'renders the plan selection UI by default', () => {
		renderModal();

		expect(
			screen.getByText( 'Select a plan to give complimentary access to this user:' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Confirm' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
	} );

	it( 'hides already-comped plans from the dropdown', async () => {
		const user = userEvent.setup();
		renderModal( { compedPlanIds: [ 100 ] } );

		await user.click( screen.getByRole( 'button', { name: 'No product selected' } ) );

		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Yearly Subscription : $40.00 / year' } )
		).toBeInTheDocument();
		expect(
			screen.queryByRole( 'menuitemcheckbox', {
				name: 'Monthly Subscription : $5.00 / month',
			} )
		).not.toBeInTheDocument();
	} );

	it( 'shows all-comped message when all plans are comped', () => {
		renderModal( {
			compedPlanIds: [ 100, 200 ],
		} );

		expect(
			screen.getByText( 'This subscriber already has complimentary access to all plans.' )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Confirm' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Cancel' } ) ).not.toBeInTheDocument();
	} );

	it( 'calls onClose when Close is clicked in all-comped state', async () => {
		const user = userEvent.setup();
		const { props } = renderModal( {
			compedPlanIds: [ 100, 200 ],
		} );

		const closeButtons = screen.getAllByRole( 'button', { name: 'Close' } );
		// Click the modal body Close button (not the modal X button)
		await user.click( closeButtons[ closeButtons.length - 1 ] );

		expect( props.onClose ).toHaveBeenCalled();
	} );

	it( 'disables Confirm button when no plan is selected', () => {
		renderModal();

		expect( screen.getByRole( 'button', { name: 'Confirm' } ) ).toBeDisabled();
	} );
} );
