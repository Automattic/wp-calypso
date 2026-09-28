/** @jest-environment jsdom */

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import FeatureLossConfirmationModal from 'calypso/my-sites/plans-features-main/components/feature-loss-confirmation-modal';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const defaultProps = {
	isOpen: true,
	currentPlanSlug: 'free_plan',
	targetPlanSlug: 'personal-bundle',
	currentPlanName: 'Free',
	targetPlanName: 'Personal',
	lostFeatures: [
		{ feature: 'donations', in_use: true },
		{ feature: 'payment-buttons', in_use: null },
	],
	onClose: jest.fn(),
	onConfirm: jest.fn(),
};

describe( 'FeatureLossConfirmationModal', () => {
	beforeEach( () => jest.clearAllMocks() );

	test( 'names every feature the upgrade would remove', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		expect( screen.getByText( /Donations/ ) ).toBeInTheDocument();
		expect( screen.getByText( /Payment button/ ) ).toBeInTheDocument();
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

	test( 'names both plans, so the legacy set and the target are clear', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		expect(
			screen.getByText( /Your site is on an older Free plan, with a legacy feature set/ )
		).toBeInTheDocument();
		expect( screen.getByText( /not included in a Personal plan/ ) ).toBeInTheDocument();
	} );

	test( 'links to the plan comparison support document, and records the click', () => {
		renderWithProvider( <FeatureLossConfirmationModal { ...defaultProps } /> );

		const link = screen.getByRole( 'link', { name: /See what’s included in each plan/ } );
		expect( link ).toHaveAttribute( 'href', expect.stringContaining( 'support/plan-features' ) );

		fireEvent.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_plans_legacy_feature_modal_support_link_click',
			{ current_plan: 'free_plan', target_plan: 'personal-bundle' }
		);
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

		expect( screen.queryByText( /Donations/ ) ).not.toBeInTheDocument();
	} );
} );
