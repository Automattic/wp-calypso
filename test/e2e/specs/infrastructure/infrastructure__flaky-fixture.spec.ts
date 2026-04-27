import { expect, tags, test } from '../../lib/pw-base';

/**
 * Intentionally-flaky fixture used to exercise the `fix-flaky-e2e` skill.
 * Tagged @calypso-pr so it runs (and intermittently fails) in the PR pipeline.
 */
test.describe( 'Infrastructure: Flaky fixture (testing only)', { tag: [ tags.CALYPSO_PR ] }, () => {
	test( 'Flaky by random chance', async ( { page } ) => {
		await test.step( 'Given a loaded page', async function () {
			await page.goto( 'data:text/html,<html><body><h1>Flaky</h1></body></html>' );
			await expect( page.getByRole( 'heading', { name: 'Flaky' } ) ).toBeVisible();
		} );

		await test.step( 'Then a coin flip decides the result', async function () {
			const roll = Math.random();
			expect( roll, `random roll was ${ roll }` ).toBeGreaterThan( 0.4 );
		} );
	} );

	test( 'Flaky by race condition', async ( { page } ) => {
		await test.step( 'Given a page that adds an element after a variable delay', async function () {
			await page.goto(
				`data:text/html,<html><body><div id="host"></div><script>
						setTimeout(() => {
							const el = document.createElement('span');
							el.id = 'late';
							el.textContent = 'ready';
							document.getElementById('host').appendChild(el);
						}, 50 + Math.floor(Math.random() * 800));
					</script></body></html>`
			);
		} );

		await test.step( 'Then the element becomes visible', async function () {
			await expect( page.locator( '#late' ) ).toBeVisible();
		} );
	} );
} );
