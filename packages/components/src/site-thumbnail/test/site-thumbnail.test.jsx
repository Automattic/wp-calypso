/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';
import { SiteThumbnail, SITE_THUMBNAIL_DIMENSIONS } from '..';

const CLASS_NAME = 'site-thumbnail__image';
const IMG_SELECTOR = `.${ CLASS_NAME }`;
const MSHOTS_URL = 'https://fakeUrl';

describe( 'SiteThumbnail', () => {
	test( 'has an image that points to mshot', () => {
		const siteThumbnail = shallow( <SiteThumbnail mShotsUrl={ MSHOTS_URL } /> );
		const img = siteThumbnail.find( IMG_SELECTOR );
		expect( img.exists() ).toEqual( true );

		expect(
			img
				.prop( 'src' )
				.includes( 'https://s0.wp.com/mshots/v1/' + encodeURIComponent( MSHOTS_URL ) )
		).toEqual( true );
	} );

	test( 'should show the dimension width for the default sizes', () => {
		const dimension = {
			width: 100,
			height: 100,
		};
		const siteThumbnail = shallow(
			<SiteThumbnail mShotsUrl={ MSHOTS_URL } dimension={ dimension } />
		);
		const img = siteThumbnail.find( IMG_SELECTOR );
		expect( img.prop( 'sizes' ) ).toEqual( `${ dimension.width }px` );
	} );

	test( 'should use the sizesAttr prop as sizes attr', () => {
		const sizesAttr = '(max-width: 400px) 100vw, 400px';
		const siteThumbnail = shallow(
			<SiteThumbnail mShotsUrl={ MSHOTS_URL } sizesAttr={ sizesAttr } />
		);
		const img = siteThumbnail.find( IMG_SELECTOR );
		expect( img.prop( 'sizes' ) ).toEqual( sizesAttr );
	} );

	test( 'should generate responsive size alternatives 2x and 3x srcset', () => {
		const dimension = SITE_THUMBNAIL_DIMENSIONS.medium;
		const siteThumbnail = shallow(
			<SiteThumbnail mShotsUrl={ MSHOTS_URL } dimension={ dimension } />
		);
		const srcSet = siteThumbnail.find( IMG_SELECTOR ).prop( 'srcSet' );
		const srcSet2xWith = ` ${ dimension.width * 2 }w`;
		expect( srcSet.includes( srcSet2xWith ) ).toEqual( true );
		const srcSet3xWith = ` ${ dimension.width * 3 }w`;
		expect( srcSet.includes( srcSet3xWith ) ).toEqual( true );
	} );

	test( 'should add dimensionsSrcSet array prop to srcset string attribute', () => {
		const alternativeDimensions = [
			{
				width: 777,
				height: 777,
			},
			{
				width: 888,
				height: 888,
			},
		];
		const siteThumbnail = shallow(
			<SiteThumbnail mShotsUrl={ MSHOTS_URL } dimensionsSrcset={ alternativeDimensions } />
		);
		const srcSet = siteThumbnail.find( IMG_SELECTOR ).prop( 'srcSet' );
		alternativeDimensions.forEach( ( dimension ) => {
			const srcSetWith = ` ${ dimension.width }w`;
			expect( srcSet.includes( srcSetWith ) ).toEqual( true );
		} );
	} );
} );
