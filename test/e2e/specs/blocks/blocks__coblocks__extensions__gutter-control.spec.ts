import { EditorPage, PricingTableBlock } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'CoBlocks: Extensions: Gutter Control', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can use CoBlocks gutter control', async ( {
		page,
		accountGivenByEnvironment,
		environment,
	} ) => {
		const isAtomic = environment.TEST_ON_ATOMIC;
		const isSimple = ! environment.TEST_ON_ATOMIC;

		let editorPage: EditorPage;
		let pricingTableBlock: PricingTableBlock;

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		await test.step( 'And I insert a Pricing Table block', async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( page, blockHandle );
		} );

		await test.step( 'And I open the settings sidebar', async function () {
			await editorPage.openSettings();
		} );

		if ( ! isAtomic ) {
			await test.step( 'Then the "None" gutter is available', async function () {
				await pricingTableBlock.setGutter( 'None' );
			} );
		}

		await test.step( 'And the "Small" gutter is available', async function () {
			await pricingTableBlock.setGutter( 'Small' );
		} );

		await test.step( 'And the "Medium" gutter is available', async function () {
			await pricingTableBlock.setGutter( 'Medium' );
		} );

		await test.step( 'And the "Large" gutter is available', async function () {
			await pricingTableBlock.setGutter( 'Large' );
		} );

		if ( ! isAtomic ) {
			await test.step( 'And the "Huge" gutter is available', async function () {
				await pricingTableBlock.setGutter( 'Huge' );
			} );
		}

		if ( ! isSimple ) {
			await test.step( 'And the "Custom" gutter is available', async function () {
				await pricingTableBlock.setGutter( 'Custom', 2.7 );
			} );
		}

		await test.step( 'When I close the settings sidebar', async function () {
			await editorPage.closeSettings();
		} );

		await test.step( 'And I fill the price fields so the block is visible', async function () {
			await pricingTableBlock.enterPrice( 1, 4.99 );
			await pricingTableBlock.enterPrice( 2, 9.99 );
		} );

		await test.step( 'And I publish and visit the post', async function () {
			await editorPage.publish( { visit: true } );
		} );

		if ( ! isAtomic ) {
			await test.step( 'Then the class for "Huge" gutter is present', async function () {
				await page.locator( '.wp-block-coblocks-pricing-table .has-huge-gutter' ).waitFor();
			} );
		}

		if ( ! isSimple ) {
			await test.step( 'Then the proper value for "Custom" gutter is set', async function () {
				await page
					.locator( '.wp-block-coblocks-pricing-table [style="--coblocks-custom-gutter:2.7em"]' )
					.waitFor();
			} );
		}
	} );
} );
