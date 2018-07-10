/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { BlockModeToggle } from '../block-mode-toggle';

describe( 'BlockModeToggle', () => {
	it( 'should not render the HTML mode button if the block doesn\'t support it', () => {
		const wrapper = shallow(
			<BlockModeToggle blockType={ { supports: { html: false } } } />
		);

		expect( wrapper.equals( null ) ).toBe( true );
	} );

	it( 'should render the HTML mode button', () => {
		const wrapper = shallow(
			<BlockModeToggle
				blockType={ { supports: { html: true } } }
				mode="visual"
			/>
		);
		const text = wrapper.find( 'IconButton' ).first().prop( 'children' );

		expect( text ).toEqual( 'Edit as HTML' );
	} );

	it( 'should render the Visual mode button', () => {
		const wrapper = shallow(
			<BlockModeToggle
				blockType={ { supports: { html: true } } }
				mode="html"
			/>
		);
		const text = wrapper.find( 'IconButton' ).first().prop( 'children' );

		expect( text ).toEqual( 'Edit visually' );
	} );
} );
