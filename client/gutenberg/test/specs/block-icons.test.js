/**
 * Internal dependencies
 */
import {
	newPost,
	insertBlock,
	searchForBlock,
	selectBlockByClientId,
} from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

const INSERTER_BUTTON_SELECTOR = '.components-popover__content .editor-block-types-list__item';
const INSERTER_ICON_WRAPPER_SELECTOR = `${ INSERTER_BUTTON_SELECTOR } .editor-block-types-list__item-icon`;
const INSERTER_ICON_SELECTOR = `${ INSERTER_BUTTON_SELECTOR } .editor-block-icon`;
const INSPECTOR_ICON_SELECTOR = '.edit-post-sidebar .editor-block-icon';

async function getInnerHTML( selector ) {
	return await page.$eval( selector, ( element ) => element.innerHTML );
}

async function getBackgroundColor( selector ) {
	return await page.$eval( selector, ( element ) => {
		return window.getComputedStyle( element ).backgroundColor;
	} );
}

async function getColor( selector ) {
	return await page.$eval( selector, ( element ) => {
		return window.getComputedStyle( element ).color;
	} );
}

async function getFirstInserterIcon() {
	return await getInnerHTML( INSERTER_ICON_SELECTOR );
}

describe( 'Correctly Renders Block Icons on Inserter and Inspector', () => {
	const dashIconRegex = /<svg.*?class=".*?dashicons-cart.*?">.*?<\/svg>/;
	const circleString = '<circle cx="10" cy="10" r="10" fill="red" stroke="blue" stroke-width="10"></circle>';
	const svgIcon = new RegExp( `<svg.*?viewBox="0 0 20 20".*?>${ circleString }</svg>` );

	const getBlockIdFromBlockName = async ( blockName ) => {
		return await page.$eval(
			`[data-type="${ blockName }"] > .editor-block-list__block-edit`,
			( el ) => el.getAttribute( 'data-block' )
		);
	};

	const validateSvgIcon = ( iconHtml ) => {
		expect( iconHtml ).toMatch( svgIcon );
	};

	const validateDashIcon = ( iconHtml ) => {
		expect( iconHtml ).toMatch( dashIconRegex );
	};

	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-block-icons' );
	} );

	beforeEach( async () => {
		await newPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-block-icons' );
	} );

	function testIconsOfBlock( blockName, blockTitle, validateIcon ) {
		it( 'Renders correctly the icon in the inserter', async () => {
			await searchForBlock( blockTitle );
			validateIcon( await getFirstInserterIcon() );
		} );

		it( 'Can insert the block', async () => {
			await insertBlock( blockTitle );
			expect(
				await getInnerHTML( `[data-type="${ blockName }"] [data-type="core/paragraph"] p` )
			).toEqual( blockTitle );
		} );

		it( 'Renders correctly the icon on the inspector', async () => {
			await insertBlock( blockTitle );
			await selectBlockByClientId( await getBlockIdFromBlockName( blockName ) );
			validateIcon( await getInnerHTML( INSPECTOR_ICON_SELECTOR ) );
		} );
	}

	describe( 'Block with svg icon', () => {
		const blockName = 'test/test-single-svg-icon';
		const blockTitle = 'TestSimpleSvgIcon';
		testIconsOfBlock( blockName, blockTitle, validateSvgIcon );
	} );

	describe( 'Block with dash icon', () => {
		const blockName = 'test/test-dash-icon';
		const blockTitle = 'TestDashIcon';
		testIconsOfBlock( blockName, blockTitle, validateDashIcon );
	} );

	describe( 'Block with function icon', () => {
		const blockName = 'test/test-function-icon';
		const blockTitle = 'TestFunctionIcon';
		testIconsOfBlock( blockName, blockTitle, validateSvgIcon );
	} );

	describe( 'Block with dash icon and background and foreground colors', () => {
		const blockName = 'test/test-dash-icon-colors';
		const blockTitle = 'TestDashIconColors';
		it( 'Renders the icon in the inserter with the correct colors', async () => {
			await searchForBlock( blockTitle );
			validateDashIcon( await getFirstInserterIcon() );
			expect( await getBackgroundColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual( 'rgb(254, 0, 0)' );
		} );

		it( 'Renders the icon in the inspector with the correct colors', async () => {
			await insertBlock( blockTitle );
			await selectBlockByClientId( await getBlockIdFromBlockName( blockName ) );
			validateDashIcon(
				await getInnerHTML( INSPECTOR_ICON_SELECTOR )
			);
			expect( await getBackgroundColor( INSPECTOR_ICON_SELECTOR ) ).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSPECTOR_ICON_SELECTOR ) ).toEqual( 'rgb(254, 0, 0)' );
		} );
	} );

	describe( 'Block with svg icon and background color', () => {
		const blockName = 'test/test-svg-icon-background';
		const blockTitle = 'TestSvgIconBackground';
		it( 'Renders the icon in the inserter with the correct background color and an automatically compute readable foreground color', async () => {
			await searchForBlock( blockTitle );
			validateSvgIcon( await getFirstInserterIcon() );
			expect( await getBackgroundColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual( 'rgb(248, 249, 249)' );
		} );

		it( 'Renders correctly the icon on the inspector', async () => {
			await insertBlock( blockTitle );
			await selectBlockByClientId( await getBlockIdFromBlockName( blockName ) );
			validateSvgIcon(
				await getInnerHTML( INSPECTOR_ICON_SELECTOR )
			);
			expect( await getBackgroundColor( INSPECTOR_ICON_SELECTOR ) ).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSPECTOR_ICON_SELECTOR ) ).toEqual( 'rgb(248, 249, 249)' );
		} );
	} );
} );
