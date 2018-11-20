/**
 * Internal dependencies
 */
import {
	newPost,
	observeFocusLoss,
	pressWithModifier,
	setViewport,
} from '../support/utils';

const SIDEBAR_SELECTOR = '.edit-post-sidebar';
const ACTIVE_SIDEBAR_TAB_SELECTOR = '.edit-post-sidebar__panel-tab.is-active';
const ACTIVE_SIDEBAR_BUTTON_TEXT = 'Document';

describe( 'Publishing', () => {
	beforeAll( () => {
		observeFocusLoss();
	} );

	it( 'Should have sidebar visible at the start with document sidebar active on desktop', async () => {
		await setViewport( 'large' );
		await newPost();
		const { nodesCount, content, height, width } = await page.$$eval( ACTIVE_SIDEBAR_TAB_SELECTOR, ( nodes ) => {
			const firstNode = nodes[ 0 ];
			return {
				nodesCount: nodes.length,
				content: firstNode.innerText,
				height: firstNode.offsetHeight,
				width: firstNode.offsetWidth,
			};
		} );

		// should have only one active sidebar tab.
		expect( nodesCount ).toBe( 1 );

		// the active sidebar tab should be document.
		expect( content ).toBe( ACTIVE_SIDEBAR_BUTTON_TEXT );

		// the active sidebar tab should be visible
		expect( width ).toBeGreaterThan( 10 );
		expect( height ).toBeGreaterThan( 10 );
	} );

	it( 'Should have the sidebar closed by default on mobile', async () => {
		await setViewport( 'small' );
		await newPost();
		const sidebar = await page.$( SIDEBAR_SELECTOR );
		expect( sidebar ).toBeNull();
	} );

	it( 'Should close the sidebar when resizing from desktop to mobile', async () => {
		await setViewport( 'large' );
		await newPost();

		const sidebars = await page.$$( SIDEBAR_SELECTOR );
		expect( sidebars ).toHaveLength( 1 );

		await setViewport( 'small' );

		const sidebarsMobile = await page.$$( SIDEBAR_SELECTOR );
		// sidebar should be closed when resizing to mobile.
		expect( sidebarsMobile ).toHaveLength( 0 );
	} );

	it( 'Should reopen sidebar the sidebar when resizing from mobile to desktop if the sidebar was closed automatically', async () => {
		await setViewport( 'large' );
		await newPost();
		await setViewport( 'small' );

		const sidebarsMobile = await page.$$( SIDEBAR_SELECTOR );
		expect( sidebarsMobile ).toHaveLength( 0 );

		await setViewport( 'large' );

		const sidebarsDesktop = await page.$$( SIDEBAR_SELECTOR );
		expect( sidebarsDesktop ).toHaveLength( 1 );
	} );

	it( 'Should preserve tab order while changing active tab', async () => {
		await newPost();

		// Region navigate to Sidebar.
		await pressWithModifier( 'Control', '`' );
		await pressWithModifier( 'Control', '`' );
		await pressWithModifier( 'Control', '`' );
		await pressWithModifier( 'Control', '`' );

		// Tab lands at first (presumed selected) option "Document".
		await page.keyboard.press( 'Tab' );
		const isActiveDocumentTab = await page.evaluate( () => (
			document.activeElement.textContent === 'Document' &&
			document.activeElement.classList.contains( 'is-active' )
		) );
		expect( isActiveDocumentTab ).toBe( true );

		// Tab into and activate "Block".
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Space' );
		const isActiveBlockTab = await page.evaluate( () => (
			document.activeElement.textContent === 'Block' &&
			document.activeElement.classList.contains( 'is-active' )
		) );
		expect( isActiveBlockTab ).toBe( true );
	} );
} );
