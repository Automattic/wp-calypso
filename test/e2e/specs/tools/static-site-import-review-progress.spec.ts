import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Static site import review and progress', { tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS ] }, () => {
	test.skip(
		! process.env.STATIC_SITE_IMPORT_E2E,
		'Requires a local Calypso server with migration/static-site-import enabled.'
	);

	test( 'reviews, approves, and observes a mocked import session without production writes', async ( {
		page,
		sitePublic,
	} ) => {
		let approved = false;
		await page.context().route( '**/wpcom/v2/sites/*/static-site-import-session**', async ( route ) => {
			const request = route.request();
			const url = new URL( request.url() );
			const body = url.pathname.endsWith( '/approve' )
				? { session_id: 'session-1', plan_hash: 'hash-1', status: 'completed', state: 'finished' }
				: request.method() === 'POST'
					? {
							session_id: 'session-1',
							plan_hash: 'hash-1',
							status: 'pending',
							state: 'preview_ready',
							preview_summary: { pages: 2, posts: 4 },
						}
					: {
							session_id: 'session-1',
							plan_hash: 'hash-1',
							status: approved ? 'completed' : 'pending',
							state: approved ? 'finished' : 'preview_ready',
							preview_summary: { pages: 2, posts: 4 },
						};
			if ( url.pathname.endsWith( '/approve' ) ) {
				approved = true;
			}
			await route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( body ),
			} );
		} );

		await test.step( 'Given a mocked static import preview', async () => {
			await page.goto(
				`/setup/site-migration/static-site-import-review?siteId=${ sitePublic.blog_details.blogid }&siteSlug=${ sitePublic.blog_details.site_slug }&from=https%3A%2F%2Fsource.example`
			);
			await expect( page.getByText( 'Your import preview is ready.' ) ).toBeVisible();
		} );

		await test.step( 'When the preview is approved', async () => {
			await page.getByTestId( 'static-site-import-approve' ).click();
		} );

		await test.step( 'Then progress reaches the mocked terminal state', async () => {
			await expect( page.getByTestId( 'static-site-import-progress' ) ).toBeVisible();
			await expect( page.getByText( 'Your site import is complete' ) ).toBeVisible();
		} );
	} );
} );
