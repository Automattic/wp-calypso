import { RestAPIClient } from '@automattic/calypso-e2e';
import { test, expect } from '../../lib/pw-base';
import { locale } from '../../lib/types-shared';

const localesToTest: Array< locale > = [
	'ar',
	'de',
	'en',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];
test.describe( 'I18N: Editor', { tag: '@i18n' }, () => {
	test.describe.configure( { mode: 'serial' } ); // Since all tests use the same account which changes its locale, they should not be run in parallel
	for ( const locale of localesToTest ) {
		test( `As an i18n visitor using '${ locale }' as my locale I can see localised editor content`, async ( {
			page,
			accounti18n,
			pageEditor,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The i18n editor tests only run in Chrome' );

			await test.step( `Given I am authenticated as '${ accounti18n.accountName }'`, async function () {
				await accounti18n.authenticate( page );
			} );

			await test.step( `And I update my locale settings to ${ locale }`, async function () {
				const clientRestAPI = new RestAPIClient( accounti18n.credentials );
				await clientRestAPI.setMySettings( { language: locale } );
			} );

			await test.step( 'When I visit the editor page', async function () {
				await pageEditor.visit( 'post' );
			} );

			/**
			 * We don't test specific translations because they change frequently and would require constant maintenance.
			 * Instead, we verify that the placeholder text is translated to something other than the English default.
			 * This approach ensures that translations are present without being brittle to exact wording changes.
			 */
			await test.step( 'Then laguages other than English show non-English translations', async function () {
				const englishText = 'Add title';
				const accessibleName = await page
					.locator( 'h1.wp-block-post-title' )
					.getAttribute( 'aria-label' );
				const placeholderText = await page
					.locator( 'h1.wp-block-post-title span' )
					.getAttribute( 'data-rich-text-placeholder' );
				if ( locale === 'en' ) {
					expect.soft( accessibleName ).toBe( englishText );
					expect.soft( placeholderText ).toBe( englishText );
				} else {
					expect.soft( accessibleName ).not.toBe( englishText );
					expect.soft( accessibleName ).not.toBeNull();
					expect.soft( accessibleName ).not.toBeUndefined();
					expect.soft( placeholderText ).not.toBe( englishText );
					expect.soft( placeholderText ).not.toBeNull();
					expect.soft( placeholderText ).not.toBeUndefined();
				}
			} );
		} );
	}
} );
