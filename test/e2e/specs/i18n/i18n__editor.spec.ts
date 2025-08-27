/**
 * End-to-end Playwright test suite for verifying internationalization (i18n) of the editor interface.
 *
 * This suite iterates over a set of locales and their expected "Add title" translations, and for each:
 * - Authenticates as a test account (using/saving cookies for efficiency).
 * - Updates the account's locale setting using the REST API.
 * - Visits the editor page.
 * - Asserts that the editor's title input displays the correct localized placeholder.
 *
 * Tests are run serially to avoid conflicts from changing the shared account's locale.
 * Tests are restricted to run only in the Chrome browser.
 *
 * @file I18N: Editor E2E tests for localized editor content.
 * @tag @i18n
 * @see Translation
 */
import { RestAPIClient } from '@automattic/calypso-e2e';
import { test, expect } from '../../lib/pw_base';
import { Translation } from '../../lib/types_shared';

const translationsToTest: Array< Translation > = [
	{ locale: 'ar', addTitle: 'أضف عنوانًا' },
	{ locale: 'de', addTitle: 'Titel hier eingeben' },
	{ locale: 'en', addTitle: 'Add title' },
	{ locale: 'es', addTitle: 'Añadir título' },
	{ locale: 'fr', addTitle: 'Ajout de titre' },
	{ locale: 'he', addTitle: 'הוספת כותרת' },
	{ locale: 'id', addTitle: 'Tambahkan judul' },
	{ locale: 'it', addTitle: 'Aggiungi un titolo' },
	{ locale: 'ja', addTitle: 'タイトルを追加' },
	{ locale: 'ko', addTitle: '제목 추가' },
	{ locale: 'nl', addTitle: 'Titel toevoegen' },
	{ locale: 'pt-br', addTitle: 'Adicionar título' },
	{ locale: 'ru', addTitle: 'Добавить заголовок' },
	{ locale: 'sv', addTitle: 'Lägg till rubrik' },
	{ locale: 'tr', addTitle: 'Başlık ekle' },
	{ locale: 'zh-cn', addTitle: '添加标题' },
	{ locale: 'zh-tw', addTitle: '新增標題' },
];

test.describe( 'I18N: Editor', { tag: '@i18n' }, () => {
	test.describe.configure( { mode: 'serial' } ); // Since all tests use the same account which changes its locale, they should not be run in parallel
	for ( const translation of translationsToTest ) {
		test( `As an i18n visitor using '${ translation.locale }' as my locale I can see localised editor content`, async ( {
			page,
			accounti18n,
			pageEditor,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The i18n editor tests only run in Chrome' );

			await test.step( `Given I am authenticated as '${ accounti18n.accountName }'`, async function () {
				await accounti18n.authenticate( page );
			} );

			await test.step( `And I update my locale settings to ${ translation.locale }`, async function () {
				const clientRestAPI = new RestAPIClient( accounti18n.credentials );
				await clientRestAPI.setMySettings( { language: translation.locale } );
				await page.reload();
			} );

			await test.step( 'When I visit the editor page', async function () {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'Then I can see the following see the correct translations', async function () {
				await expect
					.soft( page.locator( 'h1.editor-post-title' ) )
					.toHaveAttribute( 'aria-label', translation.addTitle );
			} );
		} );
	}
} );
