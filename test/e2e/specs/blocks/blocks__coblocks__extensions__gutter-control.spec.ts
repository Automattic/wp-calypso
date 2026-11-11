import {
	PricingTableBlock,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

const isAtomic = envVariables.TEST_ON_ATOMIC;
const features = envToFeatureKey( envVariables );
// For this spec, all Atomic testing is always edge.
// See https://github.com/Automattic/wp-calypso/pull/73052
if ( isAtomic ) {
	features.coblocks = 'edge';
}

/**
 * This spec requires the following:
 * 	- theme: a non-block-based theme (eg. Twenty-Twenty One)
 */
test.describe( 'CoBlocks: Extensions: Gutter Control', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can change CoBlocks gutter control settings', async ( {
		page,
		pageEditor,
	} ) => {
		// Must resolve inside the test: a throw at describe scope aborts collection for the entire run.
		const accountName = getTestAccountByFeature( features );
		let pricingTableBlock: PricingTableBlock;

		await test.step( 'Given I am authenticated', async () => {
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async () => {
			const testAccount = new TestAccount( accountName );
			const siteSlug = testAccount.getSiteURL( { protocol: false } );
			await pageEditor.visit( 'post', { siteSlug } );
		} );

		await test.step( 'When I insert Pricing Table block', async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( page, blockHandle );
		} );

		await test.step( 'When I open settings sidebar', async () => {
			await pageEditor.openSettings();
		} );

		if ( ! isAtomic ) {
			await test.step( 'When I verify "None" gutter is available', async () => {
				await pricingTableBlock!.setGutter( 'None' );
			} );
		}

		await test.step( 'When I verify "Small" gutter is available', async () => {
			await pricingTableBlock!.setGutter( 'Small' );
		} );

		await test.step( 'When I verify "Medium" gutter is available', async () => {
			await pricingTableBlock!.setGutter( 'Medium' );
		} );

		await test.step( 'When I verify "Large" gutter is available', async () => {
			await pricingTableBlock!.setGutter( 'Large' );
		} );

		if ( ! isAtomic ) {
			await test.step( 'When I verify "Huge" gutter is available', async () => {
				await pricingTableBlock!.setGutter( 'Huge' );
			} );
		}

		if ( isAtomic ) {
			await test.step( 'When I verify "Custom" gutter is available', async () => {
				await pricingTableBlock!.setGutter( 'Custom', 2.7 );
			} );
		}

		await test.step( 'When I close settings sidebar', async () => {
			await pageEditor.closeSettings();
		} );

		await test.step( 'When I fill the price fields so the block is visible', async () => {
			await pricingTableBlock!.enterPrice( 1, 4.99 );
			await pricingTableBlock!.enterPrice( 2, 9.99 );
		} );

		await test.step( 'When I publish and visit the post', async () => {
			await pageEditor.publish( { visit: true } );
		} );

		if ( ! isAtomic ) {
			await test.step( 'Then the class for "Huge" gutter is present', async () => {
				await page.locator( '.wp-block-coblocks-pricing-table .has-huge-gutter' ).waitFor();
			} );
		}

		if ( isAtomic ) {
			await test.step( 'Then the proper value for "Custom" gutter is set', async () => {
				await page
					.locator( '.wp-block-coblocks-pricing-table [style="--coblocks-custom-gutter:2.7em"]' )
					.waitFor();
			} );
		}
	} );
} );
