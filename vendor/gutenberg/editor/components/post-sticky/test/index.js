/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostStickyCheck } from '../check';

describe( 'PostSticky', () => {
	it( 'should not render anything if the post type is not "post"', () => {
		const wrapper = shallow(
			<PostStickyCheck postType="page" hasStickyAction={ true }>
				Can Toggle Sticky
			</PostStickyCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if post doesn\'t support stickying', () => {
		const wrapper = shallow(
			<PostStickyCheck postType="post" hasStickyAction={ false }>
				Can Toggle Sticky
			</PostStickyCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render if the post supports stickying', () => {
		const wrapper = shallow(
			<PostStickyCheck postType="post" hasStickyAction={ true }>
				Can Toggle Sticky
			</PostStickyCheck>
		);
		expect( wrapper.type() ).not.toBe( null );
	} );
} );
