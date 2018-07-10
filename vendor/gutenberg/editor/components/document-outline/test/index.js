/**
 * External dependencies
 */
import { mount, shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/core-blocks';

/**
 * Internal dependencies
 */
import { DocumentOutline } from '../';

jest.mock( '../../block-title', () => () => 'Block Title' );

describe( 'DocumentOutline', () => {
	registerCoreBlocks();

	const paragraph = createBlock( 'core/paragraph' );
	const headingH1 = createBlock( 'core/heading', {
		content: 'Heading 1',
		level: 1,
	} );
	const headingParent = createBlock( 'core/heading', {
		content: 'Heading parent',
		level: 2,
	} );
	const headingChild = createBlock( 'core/heading', {
		content: 'Heading child',
		level: 3,
	} );

	const nestedHeading = createBlock( 'core/columns', undefined, [ headingChild ] );

	describe( 'no header blocks present', () => {
		it( 'should not render when no blocks provided', () => {
			const wrapper = shallow( <DocumentOutline /> );

			expect( wrapper.html() ).toBe( null );
		} );

		it( 'should not render when no heading blocks provided', () => {
			const blocks = [ paragraph ];
			const wrapper = shallow( <DocumentOutline blocks={ blocks } /> );

			expect( wrapper.html() ).toBe( null );
		} );
	} );

	describe( 'header blocks present', () => {
		it( 'should match snapshot', () => {
			const blocks = [ headingParent, headingChild ];
			const wrapper = shallow( <DocumentOutline blocks={ blocks } /> );

			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'should render an item when only one heading provided', () => {
			const blocks = [ headingParent ];
			const wrapper = shallow( <DocumentOutline blocks={ blocks } /> );

			expect( wrapper.find( 'TableOfContentsItem' ) ).toHaveLength( 1 );
		} );

		it( 'should render two items when two headings and some paragraphs provided', () => {
			const blocks = [ paragraph, headingParent, paragraph, headingChild, paragraph ];
			const wrapper = shallow( <DocumentOutline blocks={ blocks } /> );

			expect( wrapper.find( 'TableOfContentsItem' ) ).toHaveLength( 2 );
		} );

		it( 'should render warnings for multiple h1 headings', () => {
			const blocks = [ headingH1, paragraph, headingH1, paragraph ];
			const wrapper = shallow( <DocumentOutline blocks={ blocks } /> );

			expect( wrapper ).toMatchSnapshot();
		} );
	} );

	describe( 'nested headings', () => {
		it( 'should render even if the heading is nested', () => {
			const tableOfContentItemsSelector = 'TableOfContentsItem';
			const outlineLevelsSelector = '.document-outline__level';
			const outlineItemContentSelector = '.document-outline__item-content';

			const blocks = [ headingParent, nestedHeading ];
			const wrapper = mount( <DocumentOutline blocks={ blocks } /> );

			//heading parent and nested heading should appear as items
			const tableOfContentItems = wrapper.find( tableOfContentItemsSelector );
			expect( tableOfContentItems ).toHaveLength( 2 );

			//heading parent test
			const firstItemLevels = tableOfContentItems.at( 0 ).find( outlineLevelsSelector );
			expect( firstItemLevels ).toHaveLength( 1 );
			expect( firstItemLevels.at( 0 ).text() ).toEqual( 'H2' );
			expect( tableOfContentItems.at( 0 ).find( outlineItemContentSelector ).text() ).toEqual( 'Heading parent' );

			//nested heading test
			const secondItemLevels = tableOfContentItems.at( 1 ).find( outlineLevelsSelector );
			expect( secondItemLevels ).toHaveLength( 2 );
			expect( secondItemLevels.at( 0 ).text() ).toEqual( 'Block Title' );
			expect( secondItemLevels.at( 1 ).text() ).toEqual( 'H3' );
			expect( tableOfContentItems.at( 1 ).find( outlineItemContentSelector ).text() ).toEqual( 'Heading child' );
		} );
	} );
} );
