import {
	setupHooks,
	DataHelper,
	LoginFlow,
	SidebarComponent,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Language' ), function () {
	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'defaultUser' );
		await loginFlow.logIn();
	} );

	it( 'Click on Add Site on Sidebar', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.switchSite();
		await sidebarComponent.addSite();

		gutenboardingFlow = new GutenboardingFlow( page );
	} );

	describe.each( [
		{ language: 'Spanish', target: 'es', acquireIntent: 'Mi página web se llama' },
		{ language: 'Japanese', target: 'ja', acquireIntent: '私のサイトの名前は' },
		{ language: 'Arabic', target: 'ar', acquireIntent: 'سيكون اسم موقعي' },
		{ language: 'Hebrew', target: 'he', acquireIntent: 'האתר שלי נקרא' },
		{ language: 'Russian', target: 'ru', acquireIntent: 'Мой сайт называется' },
	] )( 'Change Language', function ( { language, target, acquireIntent } ) {
		it( `Change language to ${ language }`, async function () {
			await gutenboardingFlow.switchLanguage( target );
		} );

		it( `Acquire intent is displayed in ${ language }`, async function () {
			await page.waitForSelector( `label:text("${ acquireIntent }")` );
		} );
	} );
} );
