/** @jest-environment jsdom */

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import FeatureLossConfirmationModal from 'calypso/my-sites/plans-features-main/components/feature-loss-confirmation-modal';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const defaultProps = {
	isOpen: true,
	targetPlanName: 'Personal',
	lostFeatures: [
		{ feature: 'donations', in_use: true },
		{ feature: 'payment-buttons', in_use: null },
	],
	gainedFeatures: [],
	onClose: jest.fn(),
	onConfirm: jest.fn(),
};

describe( 'FeatureLossConfirmationModal', () => {
	beforeEach( () => jest.clearAllMocks() );

	test( 'names every feature the upgrade would remove', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		expect( screen.getByText( 'Donations' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Payment buttons' ) ).toBeInTheDocument();
	} );

	/**
	 * The feature set is defined server-side, so a slug with no title here is possible. Showing the
	 * raw slug is ugly but visible; dropping it would understate the loss.
	 */
	test( 'falls back to the slug for an unmapped feature', () => {
		renderWithProvider(
			<FeatureLossConfirmationModal
				{ ...defaultProps }
				lostFeatures={ [ { feature: 'some-new-feature', in_use: true } ] }
			/>
		);

		expect( screen.getByText( 'some-new-feature' ) ).toBeInTheDocument();
	} );

	/**
	 * The change is partly additive, so a warning that only lists losses misrepresents it.
	 */
	test( 'lists what the upgrade adds when there is anything to add', () => {
		// Modal renders through a portal, so assertions go through `screen`, not the render container.
		renderWithProvider(
			<FeatureLossConfirmationModal { ...defaultProps } gainedFeatures={ [ 'payments' ] } />
		);

		expect( screen.getByText( 'You will also gain:' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Payments' ) ).toBeInTheDocument();
	} );

	test( 'omits the gained section when the upgrade adds nothing', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		expect( screen.queryByText( 'You will also gain:' ) ).not.toBeInTheDocument();
	} );

	/**
	 * Continue resumes the purchase and Cancel abandons it: the click that opened this modal is parked
	 * on a promise these two callbacks resolve, so neither may be silently dropped.
	 */
	test( 'reports the user’s choice to the parked purchase', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		expect( defaultProps.onConfirm ).toHaveBeenCalledTimes( 1 );

		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( defaultProps.onClose ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders nothing when closed', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } isOpen={ false } /> );

		expect( screen.queryByText( 'Donations' ) ).not.toBeInTheDocument();
	} );
} );
