/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import * as Blocks from '../blocks';

describe( 'Link block', () => {
	test( 'relativizes links to wordpress.com', () => {
		const pathAbsoluteUrl = '/my/test/link?with=params&more=stuff+plus%20junk';
		const link = shallow(
			<Blocks.Link content={ { url: `https://wordpress.com${ pathAbsoluteUrl }` } } />
		);

		expect( link.prop( 'href' ) ).toEqual( pathAbsoluteUrl );
	} );

	test( 'renders links to non-WordPress sites as-is', () => {
		const arbitraryUrl = 'http://iscalypsofastyet.com/p/buildlog?branch=master';
		const link = shallow( <Blocks.Link content={ { url: arbitraryUrl } } /> );

		expect( link.prop( 'href' ) ).toEqual( arbitraryUrl );
	} );
} );

describe( 'Post block', () => {
	test( 'links to the Trash page if the post is in the trash', () => {
		const content = {
			siteId: 1,
			isTrashed: true,
		};

		const post = shallow( <Blocks.Post content={ content } /> );

		expect( post.prop( 'href' ) ).toEqual( `/posts/${ content.siteId }/trash` );
	} );

	test( 'links to the post itself if the post is not trashed', () => {
		const content = {
			siteId: 1,
			postId: 10,
			isTrashed: false,
		};

		const post = shallow( <Blocks.Post content={ content } /> );

		expect( post.prop( 'href' ) ).toEqual(
			`/read/blogs/${ content.siteId }/posts/${ content.postId }`
		);
	} );
} );

describe( 'Theme block', () => {
	test( 'uses a relative link if the theme URI points to wordpress.com', () => {
		const content = {
			themeUri: 'https://wordpress.com/noneofthispartmatters',
			themeSlug: 'mythemeslug',
			siteSlug: 'mysiteslug',
		};

		const theme = shallow( <Blocks.Theme content={ content } meta={ {} } /> );

		expect( theme.prop( 'href' ) ).toEqual( `/theme/${ content.themeSlug }/${ content.siteSlug }` );
	} );

	test( 'opens the original theme URI in a new tab if it does not point to wordpress.com', () => {
		const content = {
			themeUri: 'https://mycoolthemesite.example/thebestthemeever',
			themeSlug: 'best-theme-ever',
			siteSlug: 'asleep-newt.jurassic.ninja',
		};

		const theme = shallow( <Blocks.Theme content={ content } meta={ {} } /> );

		expect( theme.prop( 'href' ) ).toEqual( content.themeUri );
		expect( theme.prop( 'target' ) ).toEqual( '_blank' );
		expect( theme.prop( 'rel' ) ).toEqual( 'noopener noreferrer' );
	} );

	test( 'does not render a link if no theme URI is present', () => {
		const theme = shallow( <Blocks.Theme content={ {} } /> );

		expect( theme.exists( 'a' ) ).toBe( false );
	} );
} );
