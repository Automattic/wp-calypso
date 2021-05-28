/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import SearchBlockComponent from '../../lib/gutenberg/blocks/search-block-component';

import * as driverManager from '../../lib/driver-manager';
import * as driverHelper from '../../lib/driver-helper';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.COBLOCKS_EDGE === 'true' ? 'searchSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Search Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;
	let searchBlock;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Insert Search Block and confirm it exists in te edit page: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can Insert the Search block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Search' );
			searchBlock = await SearchBlockComponent.Expect( driver );
			return await searchBlock.searchBlockVisible();
		} );

		it( 'Can see search block elements', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.searchLabelVisible();
			await searchBlock.searchInputVisible();
			await searchBlock.searchInputSendKeys( 'Type Here' );
			return searchBlock.searchButtonVisible();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the Search block in our published post', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			const placeholderValue = driver
				.findElement( SearchBlockComponent.getsearchInputElement )
				.getAttribute( 'placeholder' );
			placeholderValue.then( function ( s ) {
				assert.strictEqual( s, 'Type Here' );
			} );
			return await searchBlock.searchBlockVisible();
		} );

		it( 'Can Search non-existent content', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.searchInputSendKeys( '123456' );

			await searchBlock.searchButtonClick();

			await searchBlock.searchResultsPageTitleVisible();
			const pageTitle = SearchBlockComponent.getsearchResultsPageTitle;
			const textValue = driver.findElement( pageTitle ).getText();
			textValue.then( function ( s ) {
				assert.strictEqual( s, 'Nothing Found' );
			} );
		} );
	} );

	describe( 'Verify Search block Menubar and Settings Side bar: @parallel', function () {
		async function selectSearchBlockWidth( width ) {
			const percentageWidthSetting = By.css( 'div[aria-label="Percentage Width"]' );
			const selectWidth = await driver.findElement( percentageWidthSetting );
			const select = await selectWidth.findElement( By.xpath( `//button[text()='${ width }']` ) );
			await select.click();
		}

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can Insert the Search block', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.addBlock( 'Search' );
			searchBlock = await SearchBlockComponent.Expect( driver );
			return await searchBlock.searchBlockVisible();
		} );

		it( 'Can Toggle Search Block Label', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.searchInputClick();
			await searchBlock.searchLabelToggleButtonVisible();
			await searchBlock.searchLabelToggleButtonClick();
			return await driverHelper.waitUntilElementNotLocated(
				driver,
				SearchBlockComponent.getsearchLabelElement
			);
		} );

		it( 'Can change search button to icon', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.searchInputClick();
			await searchBlock.searchToggleButtonIconVisible();
			await searchBlock.searchToggleButtonIconClick();
			return await searchBlock.searchHasIconButtonVisible();
		} );

		it( 'Can remove search button', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.changeSearchButtonPositionClick();
			await searchBlock.changeSearchButtonPositionMenuVisible();
			await searchBlock.changeSearchButtonPositionMenuNoButtonClick();
			return await driverHelper.waitUntilElementNotLocated(
				driver,
				SearchBlockComponent.getsearchButtonElement
			);
		} );

		it( 'Can Search block settings', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await searchBlock.searchInputClick();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.openSidebar();
			selectSearchBlockWidth( 25 );
			return await searchBlock.searchBlockInsideWrapperVisible();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see the 25% Search block in published post without label and button', async function () {
			searchBlock = await SearchBlockComponent.Expect( driver );
			await driverHelper.waitUntilElementNotLocated(
				driver,
				SearchBlockComponent.getsearchLabelElement
			);
			await driverHelper.waitUntilElementNotLocated(
				driver,
				SearchBlockComponent.getsearchButtonElement
			);
			const width = await driver
				.findElement( SearchBlockComponent.getSearchBlockInsideWrapper )
				.getAttribute( 'style' );
			assert.deepStrictEqual( width, 'width: 25%;' );
			return await searchBlock.searchBlockVisible();
		} );
	} );
} );
