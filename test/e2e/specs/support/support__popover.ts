/**
 * @group calypso-pr
 */

import {
	SupportComponent,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( 'Support: Popover/Invalid Keywords', function () {
	let page: Page;

	let supportComponent: SupportComponent;

	beforeAll( async () => {
		page = await browser.newPage();
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Open support popover', async function () {
		supportComponent = new SupportComponent( page );
		await supportComponent.openPopover();
	} );

	describe( 'Search for terms', function () {
		afterEach( async function () {
			await supportComponent.clearSearch();
		} );

		it( 'Search for "theme" returns articles and show me where links ', async function () {
			const keyword = 'theme';
			await supportComponent.search( keyword );

			const [ articles, links ] = await supportComponent.getResultCount();
			expect( articles ).toBeTruthy();
			expect( links ).toBeTruthy();
		} );

		it( 'Search for blank string returns only articles', async function () {
			const keyword = '        ';
			await supportComponent.search( keyword );

			const [ articles, links ] = await supportComponent.getResultCount();
			expect( articles ).toBeTruthy();
			expect( links ).toBeFalsy();
		} );

		it( 'Search for non-matching string returns only articles', async function () {
			const keyword = ';;;ppp;;;';
			await supportComponent.search( keyword );

			const [ articles, links ] = await supportComponent.getResultCount();
			expect( articles ).toBeTruthy();
			expect( links ).toBeFalsy();
		} );
	} );

	describe( 'Search for a valid term and open the supporting article', function () {
		it( 'Search for "domains"', async function () {
			await supportComponent.search( 'domains' );
		} );

		it( 'Click on the article with matching title', async function () {
			await supportComponent.clickResult( 'domains' );
		} );
	} );
} );
