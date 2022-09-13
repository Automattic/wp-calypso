/** @jest-environment jsdom */
import { screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { PurchasePlanDetails } from '../index';

jest.mock( 'calypso/components/data/query-plugin-keys', () => () => 'query-plugin-keys' );
jest.mock( '../billing-period', () => ( props ) => (
	<div data-testid="billing-period">{ JSON.stringify( props ) }</div>
) );

const props = {
	purchaseId: 123,
	isPlaceholder: false,
	purchase: {
		// Including only the properties that are used by this component
		id: 123,
		siteId: 123,
		productName: 'Jetpack Personal',
		productSlug: 'jetpack_premium_monthly',
		expiryStatus: 'active',
	},
	hasLoadedSites: true,
	hasLoadedPurchasesFromServer: true,
	pluginList: [
		{
			slug: 'vaultpress',
			name: 'vaultpress',
			key: 'abcdef',
			status: 'wait',
			error: null,
		},
		{ slug: 'akismet', name: 'akismet', key: 'abcdef', status: 'wait', error: null },
	],
	site: {
		ID: 123,
		name: 'Site Name',
	},
	siteId: 123,
	translate,
};

describe( 'PurchasePlanDetails', () => {
	describe( 'a jetpack plan', () => {
		it( 'should render the plugin data', () => {
			render( <PurchasePlanDetails { ...props } /> );
			expect( screen.queryByRole( 'textbox', { name: /backup/i } ) ).toBeVisible();
			expect( screen.queryByRole( 'textbox', { name: /anti-spam/i } ) ).toBeVisible();
		} );

		describe( 'a partner purchase', () => {
			it( 'should not render the PlanBillingPeriod', () => {
				const purchase = {
					...props.purchase,
					partnerName: 'partner',
				};
				render( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
				expect( screen.queryByTestId( 'billing-period' ) ).not.toBeInTheDocument();
			} );
		} );

		describe( 'not a partner purchase', () => {
			it( 'should render the PlanBillingPeriod', () => {
				render( <PurchasePlanDetails { ...props } /> );
				const el = screen.queryByTestId( 'billing-period' );
				expect( el ).toBeVisible();
				expect( JSON.parse( el.textContent ) ).toMatchObject( {
					site: props.site,
					purchase: props.purchase,
				} );
			} );
		} );
	} );

	describe( 'is loading data', () => {
		it( 'should render the placeholder', () => {
			const hasLoadedSites = false;
			const { container } = render(
				<PurchasePlanDetails { ...props } hasLoadedSites={ hasLoadedSites } />
			);
			expect( container.firstChild ).toHaveClass( 'is-placeholder' );
		} );
	} );

	describe( 'not a jetpack plan', () => {
		it( 'should return null', () => {
			const purchase = {
				...props.purchase,
				productSlug: 'business-bundle',
			};
			const { container } = render( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'expired plan', () => {
		it( 'should return null', () => {
			const purchase = {
				...props.purchase,
				expiryStatus: 'expired',
			};
			const { container } = render( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
			expect( container ).toBeEmptyDOMElement();
		} );
	} );
} );
