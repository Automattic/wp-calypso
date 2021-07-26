import {
	DataHelper,
	LoginFlow,
	MediaPage,
	SidebarComponent,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	// Parametrized test.
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	[
		[ 'Simple', 'defaultUser' ],
		[ 'Atomic', 'wooCommerceUser' ],
	].forEach( function ( [ siteType, user ] ) {
		describe( `Edit Image (${ siteType })`, function () {
			let mediaPage;

			it( 'Log In', async function () {
				const loginFlow = new LoginFlow( page, user );
				await loginFlow.logIn();
			} );

			it( 'Navigate to Media', async function () {
				const sidebarComponent = await SidebarComponent.Expect( page );
				await sidebarComponent.gotoMenu( { item: 'Media' } );
			} );

			it( 'See media gallery', async function () {
				mediaPage = await MediaPage.Expect( page );
			} );

			it( 'Show only images', async function () {
				await mediaPage.clickTab( 'Images' );
			} );

			it( 'Select the first image item', async function () {
				await mediaPage.selectItem( 1 );
			} );

			it( 'Click to edit selected image', async function () {
				await mediaPage.editImage();
			} );

			it( 'Rotate image', async function () {
				await mediaPage.rotateImage();
			} );

			it( 'Cancel image edit', async function () {
				await mediaPage.cancelImageEdit();
			} );
		} );
	} );
} );
