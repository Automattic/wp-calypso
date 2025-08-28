import { RestAPIClient } from '@automattic/calypso-e2e';
import { test, expect } from '../../lib/pw-base';
import { Translation } from '../../lib/types-shared';

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
			} );

			await test.step( 'When I visit the editor page', async function () {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'Then I can see the following see the correct translations', async function () {
				await expect( page.getByRole( 'textbox' ) ).toHaveAccessibleName( translation.addTitle );
			} );
		} );
	}
} );
