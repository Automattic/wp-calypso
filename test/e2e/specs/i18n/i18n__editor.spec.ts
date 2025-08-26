import { RestAPIClient } from '@automattic/calypso-e2e';
import { test, expect } from '../../lib/pw_base';

type LanguageSlug =
	| 'ar'
	| 'de'
	| 'en'
	| 'es'
	| 'fr'
	| 'he'
	| 'id'
	| 'it'
	| 'ja'
	| 'ko'
	| 'nl'
	| 'pt-br'
	| 'ru'
	| 'sv'
	| 'tr'
	| 'zh-cn'
	| 'zh-tw';

interface Translation {
	language: LanguageSlug;
	addTitle: string;
}

const locales: Array< Translation > = [
	{ language: 'ar', addTitle: 'أضف عنوانًا' },
	{ language: 'de', addTitle: 'Titel hier eingeben' },
	{ language: 'en', addTitle: 'Add title' },
	{ language: 'es', addTitle: 'Añadir título' },
	{ language: 'fr', addTitle: 'Ajout de titre' },
	{ language: 'he', addTitle: 'הוספת כותרת' },
	{ language: 'id', addTitle: 'Tambahkan judul' },
	{ language: 'it', addTitle: 'Aggiungi un titolo' },
	{ language: 'ja', addTitle: 'タイトルを追加' },
	{ language: 'ko', addTitle: '제목 추가' },
	{ language: 'nl', addTitle: 'Titel toevoegen' },
	{ language: 'pt-br', addTitle: 'Adicionar título' },
	{ language: 'ru', addTitle: 'Добавить заголовок' },
	{ language: 'sv', addTitle: 'Lägg till rubrik' },
	{ language: 'tr', addTitle: 'Başlık ekle' },
	{ language: 'zh-cn', addTitle: '添加标题' },
	{ language: 'zh-tw', addTitle: '新增標題' },
];

test.describe( 'I18N: Editor', { tag: '@i18n' }, () => {
	test.describe.configure( { mode: 'serial' } ); // Since all tests use the same account which changes its locale, they should not be run in parallel
	for ( const locale of locales ) {
		test( `As an i18n visitor using '${ locale.language }' as my locale I can see localised editor content`, async ( {
			page,
			accounti18n,
			pageEditor,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'We only run i18n editor tests in Chrome' );

			await test.step( `Given I am authenticated as '${ accounti18n.accountName }'`, async function () {
				await accounti18n.authenticate( page );
			} );

			await test.step( `And I update my locale settings to ${ locale.language }`, async function () {
				const clientRestAPI = new RestAPIClient( accounti18n.credentials );
				await clientRestAPI.setMySettings( { language: locale.language } );
				await page.reload();
			} );

			await test.step( 'When I visit the editor page', async function () {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'Then I can see the following see the correct translations', async function () {
				await expect
					.soft( page.locator( 'h1.editor-post-title' ) )
					.toHaveAttribute( 'aria-label', locale.addTitle );
			} );
		} );
	}
} );
