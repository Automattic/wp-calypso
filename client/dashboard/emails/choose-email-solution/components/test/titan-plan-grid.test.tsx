/**
 * @jest-environment jsdom
 */
import { TitanMailSlugs } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { IntervalLength, TitanPlanTier } from '../../../types';
import { TitanPlanGrid } from '../titan-plan-grid';
import type { Domain } from '@automattic/api-core';

const DOMAIN_NAME = 'example.com';

/**
 * Shaped like a real `/products` entry: no `downgrade_paths`, because the wpcom
 * endpoint allowlist drops that field. The grid has to work without it.
 */
function product( slug: string, productId: number ) {
	return {
		product_slug: slug,
		product_id: productId,
		product_name: slug,
		cost: 60,
		cost_smallest_unit: 6000,
		currency_code: 'USD',
		price_tier_list: [],
		price_tier_usage_quantity: null,
	};
}

function mockProducts() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/products/' )
		.query( true )
		.reply( 200, {
			[ TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ]: product(
				TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
				400
			),
			[ TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG ]: product(
				TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG,
				402
			),
			[ TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG ]: product(
				TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG,
				404
			),
		} );
}

// No blog_id, so useEmailProduct reads the global products list mocked above.
const domain = { domain: DOMAIN_NAME } as Domain;

/**
 * The grid renders before the products query settles, and an unloaded card
 * looks exactly like one with no valid downgrade target. Wait for the loaded
 * price (0 until then) so the button assertions read the settled state. At a
 * monthly interval the card shows the full cost, so that is the '60' here.
 */
async function waitForProducts() {
	await screen.findAllByText( '60' );
}

function renderGrid( props: Partial< React.ComponentProps< typeof TitanPlanGrid > > = {} ) {
	return render(
		<TitanPlanGrid
			domain={ domain }
			domainName={ DOMAIN_NAME }
			interval={ IntervalLength.Monthly }
			available
			currentTier={ TitanPlanTier.Ultra }
			canDowngrade
			{ ...props }
		/>
	);
}

describe( '<TitanPlanGrid>', () => {
	test( 'hands the caller the target product id instead of going to checkout', async () => {
		mockProducts();
		const onDowngrade = jest.fn();
		const onUpgrade = jest.fn();
		renderGrid( { onDowngrade, onUpgrade } );

		await waitForProducts();

		const downgradeButtons = screen.getAllByRole( 'button', { name: 'Downgrade' } );
		expect( downgradeButtons ).toHaveLength( 2 );

		await userEvent.click( downgradeButtons[ 1 ] );

		expect( onDowngrade ).toHaveBeenCalledWith( TitanPlanTier.Premium, 402 );
		// A downgrade is never a purchase, so the upgrade/checkout path stays untouched.
		expect( onUpgrade ).not.toHaveBeenCalled();
	} );

	test( 'offers every strictly lower tier at the current term', async () => {
		mockProducts();
		renderGrid();

		await waitForProducts();

		// Ultra is current, so both Pro and Premium are downgrade targets.
		for ( const button of screen.getAllByRole( 'button', { name: 'Downgrade' } ) ) {
			expect( button ).toBeEnabled();
		}
	} );

	test( 'offers no downgrade without a live subscription to downgrade', async () => {
		mockProducts();
		renderGrid( { canDowngrade: false } );

		await waitForProducts();

		for ( const button of screen.getAllByRole( 'button', { name: 'Downgrade' } ) ) {
			expect( button ).toBeDisabled();
		}
	} );

	test( 'offers to cancel a scheduled downgrade rather than repeating it', async () => {
		mockProducts();
		const onCancelScheduledDowngrade = jest.fn();
		const onDowngrade = jest.fn();
		renderGrid( {
			isDowngradePending: true,
			pendingDowngradeTier: TitanPlanTier.Premium,
			onCancelScheduledDowngrade,
			onDowngrade,
		} );

		await waitForProducts();

		const cancelButton = screen.getByRole( 'button', { name: 'Cancel scheduled change' } );
		await userEvent.click( cancelButton );

		expect( onCancelScheduledDowngrade ).toHaveBeenCalled();
		expect( onDowngrade ).not.toHaveBeenCalled();

		// Scheduling a second downgrade would silently replace the first.
		expect( screen.getByRole( 'button', { name: 'Downgrade' } ) ).toBeDisabled();
	} );

	test( 'still sends a higher tier through the upgrade path', async () => {
		mockProducts();
		const onUpgrade = jest.fn();
		const onDowngrade = jest.fn();
		renderGrid( { currentTier: TitanPlanTier.Pro, onUpgrade, onDowngrade } );

		await waitForProducts();

		const upgradeButtons = screen.getAllByRole( 'button', { name: 'Upgrade' } );
		await userEvent.click( upgradeButtons[ 0 ] );

		expect( onUpgrade ).toHaveBeenCalledWith( TitanPlanTier.Premium );
		expect( onDowngrade ).not.toHaveBeenCalled();
	} );
} );
