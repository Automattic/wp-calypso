import {
	arePrePublishChecksEnabled,
	disablePrePublishChecks,
	enablePrePublishChecks,
	newPost,
	openPublishPanel,
	pressWithModifier,
	publishPost,
} from '../support/utils';

describe( 'PostPublishPanel', () => {
	let werePrePublishChecksEnabled;
	beforeEach( async () => {
		await newPost( );
		werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
		if ( ! werePrePublishChecksEnabled ) {
			await enablePrePublishChecks();
		}
	} );

	afterEach( async () => {
		if ( ! werePrePublishChecksEnabled ) {
			await disablePrePublishChecks();
		}
	} );

	it( 'PrePublish: publish button should have the focus', async () => {
		await page.type( '.editor-post-title__input', 'E2E Test Post' );
		await openPublishPanel();

		const focusedElementClassList = await page.$eval( ':focus', ( focusedElement ) => {
			return Object.values( focusedElement.classList );
		} );
		expect( focusedElementClassList ).toContain( 'editor-post-publish-button' );
	} );

	it( 'PostPublish: post link should have the focus', async () => {
		const postTitle = 'E2E Test Post';
		await page.type( '.editor-post-title__input', postTitle );
		await publishPost();

		const focusedElementTag = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.tagName.toLowerCase();
		} );
		const focusedElementText = await page.$eval( ':focus', ( focusedElement ) => {
			return focusedElement.text;
		} );
		expect( focusedElementTag ).toBe( 'a' );
		expect( focusedElementText ).toBe( postTitle );
	} );

	it( 'should retain focus within the panel', async () => {
		await page.type( '.editor-post-title__input', 'E2E Test Post' );
		await openPublishPanel();
		await pressWithModifier( 'Shift', 'Tab' );

		const focusedElementClassList = await page.$eval( ':focus', ( focusedElement ) => {
			return Object.values( focusedElement.classList );
		} );
		expect( focusedElementClassList ).toContain( 'components-checkbox-control__input' );
	} );
} );
