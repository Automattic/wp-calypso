/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	clickOnMoreMenuItem,
	newPost,
	saveDraft,
	toggleOption,
} from '../support/utils';

describe( 'New User Experience (NUX)', () => {
	async function clickAllTips( page ) {
		// Click through all available tips.
		const tips = await getTips( page );
		const numberOfTips = tips.tipIds.length;

		for ( let i = 1; i < numberOfTips; i++ ) {
			await page.click( '.nux-dot-tip .components-button.is-link' );
		}

		return { numberOfTips, tips };
	}

	async function getTips( page ) {
		return await page.evaluate( () => {
			return wp.data.select( 'core/nux' ).getAssociatedGuide( 'core/editor.inserter' );
		} );
	}

	async function getTipsEnabled( page ) {
		return await page.evaluate( () => {
			return wp.data.select( 'core/nux' ).areTipsEnabled();
		} );
	}

	beforeEach( async () => {
		await newPost( { enableTips: true } );
	} );

	it( 'should show tips to a first-time user', async () => {
		const firstTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( firstTipText ).toContain( 'Welcome to the wonderful world of blocks!' );

		const [ nextTipButton ] = await page.$x( "//button[contains(text(), 'See next tip')]" );
		await nextTipButton.click();

		const secondTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( secondTipText ).toContain( 'You’ll find more settings for your page and blocks in the sidebar.' );
	} );

	it( 'should show "Got it" once all tips have been displayed', async () => {
		await clickAllTips( page );

		// Make sure "Got it" button appears on the last tip.
		const gotItButton = await page.$x( "//button[contains(text(), 'Got it')]" );
		expect( gotItButton ).toHaveLength( 1 );

		// Click the "Got it button".
		await page.click( '.nux-dot-tip .components-button.is-link' );

		// Verify no more tips are visible on the page.
		const nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Tips should not be marked as disabled, but when the user has seen all
		// of the available tips, they will not appear.
		const areTipsEnabled = await getTipsEnabled( page );
		expect( areTipsEnabled ).toEqual( true );
	} );

	it( 'should hide and disable tips if "disable tips" button is clicked', async () => {
		await page.click( '.nux-dot-tip__disable' );

		// Verify no more tips are visible on the page.
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// We should be disabling the tips so they don't appear again.
		const areTipsEnabled = await getTipsEnabled( page );
		expect( areTipsEnabled ).toEqual( false );

		// Refresh the page; tips should not show because they were disabled.
		await page.reload();

		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );
	} );

	it( 'should enable tips when the "Enable tips" option is toggled on', async () => {
		// Start by disabling tips.
		await page.click( '.nux-dot-tip__disable' );

		// Verify no more tips are visible on the page.
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Tips should be disabled in localStorage as well.
		let areTipsEnabled = await getTipsEnabled( page );
		expect( areTipsEnabled ).toEqual( false );

		// Toggle the 'Enable Tips' option to enable.
		await toggleOption( 'Enable Tips' );

		// Tips should once again appear.
		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );

		// Tips should be enabled in localStorage as well.
		areTipsEnabled = await getTipsEnabled( page );
		expect( areTipsEnabled ).toEqual( true );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7458 is fixed.
	it.skip( 'should show tips as disabled if all tips have been shown', async () => {
		await clickAllTips( page );

		// Open the "More" menu to check the "Show Tips" element.
		await page.click( '.edit-post-more-menu [aria-label="Show more tools & options"]' );
		const showTipsButton = await page.$x( '//button[contains(text(), "Show Tips")][@aria-pressed="false"]' );

		expect( showTipsButton ).toHaveLength( 1 );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7458 is fixed.
	it.skip( 'should reset tips if all tips have been shown and show tips was unchecked', async () => {
		const { numberOfTips } = await clickAllTips( page );

		// Click again to re-enable tips; they should appear.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Open the "More" menu to check the "Show Tips" element.
		await page.click( '.edit-post-more-menu [aria-label="Show more tools & options"]' );
		const showTipsButton = await page.$x( '//button[contains(text(), "Show Tips")][@aria-pressed="true"]' );

		expect( showTipsButton ).toHaveLength( 1 );

		// Tips should re-appear on the page.
		const nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );

		// Tips should be enabled again.
		const areTipsEnabled = await getTipsEnabled( page );
		expect( areTipsEnabled ).toEqual( true );

		// Dismissed tips should be reset and ready to be shown again.
		const resetTips = await getTips( page );
		const newNumberOfTips = resetTips.tipIds.length;
		expect( newNumberOfTips ).toHaveLength( numberOfTips );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7753 is fixed.
	// See: https://github.com/WordPress/gutenberg/issues/7753#issuecomment-403952816
	it.skip( 'should show tips if "Show tips" was disabled on a draft and then enabled', async () => {
		// Click the "Show tips" button (enabled by default) to disable tips.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Let's type something so there's content in this post.
		await page.click( '.editor-post-title__input' );
		await page.keyboard.type( 'Post title' );
		await clickBlockAppender();
		await page.keyboard.type( 'Post content goes here.' );
		await saveDraft();

		// Refresh the page; tips should be disabled.
		await page.reload();
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Clicking should re-enable tips.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Tips should re-appear on the page.
		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );
	} );
} );
