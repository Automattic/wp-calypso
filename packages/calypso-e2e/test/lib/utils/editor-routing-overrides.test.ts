import { describe, expect, jest, test } from '@jest/globals';
import { transformEditorRelatedUrls } from '../../../src/lib/utils/editor-routing-overrides';

const calypsoHost = 'https://wordpress.com';
jest.mock( 'config', () => {
	return {
		get: () => calypsoHost,
	};
} );

describe( 'transformEditorRelatedUrls', function () {
	test.each`
		url                                                                    | expected
		${ 'https://wordpress.com/post/testsite.wordpress.com' }               | ${ 'https://testsite.wordpress.com/wp-admin/post-new.php?calypsoify=1&post_type=post' }
		${ 'https://wordpress.com/post/testsite.wordpress.com/123' }           | ${ 'https://testsite.wordpress.com/wp-admin/post.php?calypsoify=1&post=123&action=edit' }
		${ 'https://wordpress.com/page/testsite.wordpress.com' }               | ${ 'https://testsite.wordpress.com/wp-admin/post-new.php?calypsoify=1&post_type=page' }
		${ 'https://wordpress.com/page/testsite.wordpress.com/456' }           | ${ 'https://testsite.wordpress.com/wp-admin/post.php?calypsoify=1&post=456&action=edit' }
		${ 'https://wordpress.com/site-editor/testsite.wordpress.com' }        | ${ 'https://testsite.wordpress.com/wp-admin/themes.php?page=gutenberg-edit-site' }
		${ 'https://testsite.wordpress.com/wp-admin/edit.php' }                | ${ 'https://wordpress.com/posts/testsite.wordpress.com' }
		${ 'https://testsite.wordpress.com/wp-admin/edit.php?post_type=post' } | ${ 'https://wordpress.com/posts/testsite.wordpress.com' }
		${ 'https://testsite.wordpress.com/wp-admin/edit.php?post_type=page' } | ${ 'https://wordpress.com/pages/testsite.wordpress.com' }
		${ 'https://testsite.wordpress.com/wp-admin/index.php' }               | ${ 'https://wordpress.com/home/testsite.wordpress.com' }
	`(
		'Returns $expected as transformed URL when passed $url as the original URL',
		function ( { url, expected }: { url: string; expected: string } ) {
			expect( transformEditorRelatedUrls( url ) ).toStrictEqual( expected );
		}
	);

	test.each`
		url
		${ '' }
		${ 'https://wordpress.com' }
		${ 'https://wordpress.com/media/testsite.wordpress.com' }
		${ 'https://wordpress.com/posts/testsite.wordpress.com' }
		${ 'https://wordpress.com/posts/scheduled/testsite.wordpress.com' }
		${ 'https://wordpress.com/pages/testsite.wordpress.com' }
		${ 'https://testsite.wordpress.com/wp-admin/post-new.php' }
		${ 'https://testsite.wordpress.com/wp-admin/post.php' }
	`( 'Leaves $url as it is', function ( { url }: { url: string } ) {
		expect( transformEditorRelatedUrls( url ) ).toStrictEqual( url );
	} );
} );
