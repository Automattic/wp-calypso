/**
 * @jest-environment jsdom
 */
import { useQuery } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import DowngradeConfirmationModal from '../index';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

const mockFeatures = ( data: object ) =>
	( useQuery as jest.Mock ).mockReturnValue( { data, isLoading: false } );

const defaultProps = {
	isOpen: true,
	currentPlanName: 'WordPress.com Premium (yearly)',
	targetPlanName: 'WordPress.com Premium (monthly)',
	targetPlanSlug: 'value_bundle_monthly',
	purchaseId: 1,
	isDelayedDowngrade: true,
	renewalDate: 'May 9, 2027',
	isRechargeable: true,
	onClose: jest.fn(),
	onConfirm: jest.fn(),
};

describe( 'DowngradeConfirmationModal', () => {
	test( 'describes a scheduled term change with its new price', () => {
		mockFeatures( { features: [], is_change_to_monthly: false } );

		render(
			<DowngradeConfirmationModal { ...defaultProps } isTermChange renewalPriceText="$8/month" />
		);

		expect( screen.getByRole( 'heading', { name: 'Schedule plan change' } ) ).toBeVisible();
		expect( screen.getByText( /you’ll pay \$8\/month from then on/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Schedule change' } ) ).toBeVisible();
	} );

	test( 'warns about the benefits lost when moving to monthly', () => {
		mockFeatures( {
			features: [ { feature_id: 'domain-credit', title: 'Free domain for one year' } ],
			is_change_to_monthly: true,
		} );

		render(
			<DowngradeConfirmationModal { ...defaultProps } isTermChange renewalPriceText="$8/month" />
		);

		expect(
			within( screen.getByRole( 'dialog' ) ).getByText(
				/Monthly plans don’t include some benefits/
			)
		).toBeVisible();
		expect( screen.getByText( 'Free domain for one year' ) ).toBeVisible();
	} );

	test( 'keeps the downgrade copy for a scheduled downgrade on the same term', () => {
		mockFeatures( { features: [], is_change_to_monthly: false } );

		render(
			<DowngradeConfirmationModal
				{ ...defaultProps }
				currentPlanName="WordPress.com Premium"
				targetPlanName="WordPress.com Personal"
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Schedule downgrade' } ) ).toBeVisible();
		expect(
			within( screen.getByRole( 'dialog' ) ).queryByText( /Monthly plans don’t include/ )
		).toBeNull();
	} );

	test( 'shows no monthly warning outside a term change', () => {
		mockFeatures( { features: [], is_change_to_monthly: true } );

		render( <DowngradeConfirmationModal { ...defaultProps } /> );

		expect(
			within( screen.getByRole( 'dialog' ) ).queryByText( /Monthly plans don’t include/ )
		).toBeNull();
	} );
} );
