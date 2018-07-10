/**
 * External dependencies
 */
import { create } from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { PostTypeSupportCheck } from '../';

describe( 'PostTypeSupportCheck', () => {
	it( 'renders its children when post type is not known', () => {
		let postType;
		const tree = create(
			<PostTypeSupportCheck
				postType={ postType }
				supportKeys="title">
				Supported
			</PostTypeSupportCheck>
		);

		expect( tree.toJSON() ).toBe( 'Supported' );
	} );

	it( 'does not render its children when post type is known and not supports', () => {
		const postType = {
			supports: {},
		};
		const tree = create(
			<PostTypeSupportCheck
				postType={ postType }
				supportKeys="title">
				Supported
			</PostTypeSupportCheck>
		);

		expect( tree.toJSON() ).toBe( null );
	} );

	it( 'renders its children when post type is known and supports', () => {
		const postType = {
			supports: {
				title: true,
			},
		};
		const tree = create(
			<PostTypeSupportCheck
				postType={ postType }
				supportKeys="title">
				Supported
			</PostTypeSupportCheck>
		);

		expect( tree.toJSON() ).toBe( 'Supported' );
	} );

	it( 'renders its children if some of keys supported', () => {
		const postType = {
			supports: {
				title: true,
			},
		};
		const tree = create(
			<PostTypeSupportCheck
				postType={ postType }
				supportKeys={ [ 'title', 'thumbnail' ] }>
				Supported
			</PostTypeSupportCheck>
		);

		expect( tree.toJSON() ).toBe( 'Supported' );
	} );

	it( 'does not render its children if none of keys supported', () => {
		const postType = {
			supports: {},
		};
		const tree = create(
			<PostTypeSupportCheck
				postType={ postType }
				supportKeys={ [ 'title', 'thumbnail' ] }>
				Supported
			</PostTypeSupportCheck>
		);

		expect( tree.toJSON() ).toBe( null );
	} );
} );
