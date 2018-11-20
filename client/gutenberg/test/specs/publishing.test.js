/**
 * Internal dependencies
 */
import {
	newPost,
	publishPost,
	publishPostWithoutPrePublishChecks,
	enablePrePublishChecks,
	disablePrePublishChecks,
	arePrePublishChecksEnabled,
	setViewport,
} from '../support/utils';

describe( 'Publishing', () => {
	[ 'post', 'page' ].forEach( ( postType ) => {
		let werePrePublishChecksEnabled;
		describe( `a ${ postType }`, () => {
			beforeEach( async () => {
				await newPost( postType );
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

			it( `should publish the ${ postType } and close the panel once we start editing again.`, async () => {
				await page.type( '.editor-post-title__input', 'E2E Test Post' );

				await publishPost();

				// The post-publishing panel is visible.
				expect( await page.$( '.editor-post-publish-panel' ) ).not.toBeNull();

				// Start editing again.
				await page.type( '.editor-post-title__input', ' (Updated)' );

				// The post-publishing panel is not visible anymore.
				expect( await page.$( '.editor-post-publish-panel' ) ).toBeNull();
			} );
		} );
	} );

	[ 'post', 'page' ].forEach( ( postType ) => {
		let werePrePublishChecksEnabled;
		describe( `a ${ postType } with pre-publish checks disabled`, () => {
			beforeEach( async () => {
				await newPost( postType );
				werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
				if ( werePrePublishChecksEnabled ) {
					await disablePrePublishChecks();
				}
			} );

			afterEach( async () => {
				if ( werePrePublishChecksEnabled ) {
					await enablePrePublishChecks();
				}
			} );

			it( `should publish the ${ postType } without opening the post-publish sidebar.`, async () => {
				await page.type( '.editor-post-title__input', 'E2E Test Post' );

				// The "Publish" button should be shown instead of the "Publish..." toggle
				expect( await page.$( '.editor-post-publish-panel__toggle' ) ).toBeNull();
				expect( await page.$( '.editor-post-publish-button' ) ).not.toBeNull();

				await publishPostWithoutPrePublishChecks();

				// The post-publishing panel should have been not shown.
				expect( await page.$( '.editor-post-publish-panel' ) ).toBeNull();
			} );
		} );
	} );

	[ 'post', 'page' ].forEach( ( postType ) => {
		let werePrePublishChecksEnabled;
		describe( `a ${ postType } in small viewports`, () => {
			beforeEach( async () => {
				await newPost( postType );
				werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
				if ( werePrePublishChecksEnabled ) {
					await disablePrePublishChecks();
				}
				await setViewport( 'small' );
			} );

			afterEach( async () => {
				await setViewport( 'large' );
				if ( werePrePublishChecksEnabled ) {
					await enablePrePublishChecks();
				}
			} );

			it( `should ignore the pre-publish checks and show the Publish... toggle instead of the Publish button`, async () => {
				expect( await page.$( '.editor-post-publish-panel__toggle' ) ).not.toBeNull();
				expect( await page.$( '.editor-post-publish-button' ) ).toBeNull();
			} );
		} );
	} );
} );
