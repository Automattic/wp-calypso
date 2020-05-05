/**
 * Internal dependencies
 */
import MediaQueryManager from '../';

/**
 * Constants
 */
const DEFAULT_MEDIA = {
	ID: 42,
	URL: 'https://example.files.wordpress.com/2014/06/flower.gif',
	guid: 'http://example.files.wordpress.com/2014/06/flower.gif',
	date: '2014-06-12T22:12:30+00:00',
	post_ID: 41,
	author_ID: 73705554,
	file: 'flower.gif',
	mime_type: 'image/gif',
	extension: 'gif',
	title: 'flower',
	caption: '',
	description: '',
	alt: '',
	icon: 'https://s1.wp.com/wp-includes/images/media/default.png',
	thumbnails: {},
	height: 405,
	width: 600,
	exif: {},
};

const makeComparator = ( query ) => ( a, b ) => MediaQueryManager.compare( query, a, b );

describe( 'MediaQueryManager', () => {
	describe( '#matches()', () => {
		describe( 'query.search', () => {
			test( 'should return false for a non-matching search', () => {
				const isMatch = MediaQueryManager.matches(
					{
						search: 'Cars',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true for an empty search', () => {
				const isMatch = MediaQueryManager.matches(
					{
						search: '',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true for a matching title search', () => {
				const isMatch = MediaQueryManager.matches(
					{
						search: 'lower',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should search case-insensitive', () => {
				const isMatch = MediaQueryManager.matches(
					{
						search: 'fLoWeR',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );
		} );

		describe( 'query.mime_type', () => {
			test( 'should return true for an empty mime type', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: '',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true an exact match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image/gif',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true for mime subgroup exact match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true for mime subgroup exact match with trailing slash', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image/',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false for mime subgroup partial match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'imag',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return false for mime group partial match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image/gi',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true for wildcard match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: '%',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false for mime subgroup wildcard match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: '%/gif',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true for mime group wildcard match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image/%',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false for mime subgroup partial wildcard match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'ima%/%',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return false for mime group partial wildcard match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						mime_type: 'image/gi%',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );
		} );

		describe( 'query.post_ID', () => {
			test( 'should return false if post ID does not match', () => {
				const isMatch = MediaQueryManager.matches(
					{
						post_ID: 0,
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true if post ID matches', () => {
				const isMatch = MediaQueryManager.matches(
					{
						post_ID: 41,
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );
		} );

		describe( 'query.before', () => {
			test( 'should return false if query is not ISO 8601', () => {
				const isMatch = MediaQueryManager.matches(
					{
						before: '2018',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return false if media is not before date', () => {
				const isMatch = MediaQueryManager.matches(
					{
						before: '2010-04-25T15:47:33-04:00',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true if media is before date', () => {
				const isMatch = MediaQueryManager.matches(
					{
						before: '2018-04-25T15:47:33-04:00',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );
		} );

		describe( 'query.after', () => {
			test( 'should return false if query is not ISO 8601', () => {
				const isMatch = MediaQueryManager.matches(
					{
						after: '2010',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return false if media is not after date', () => {
				const isMatch = MediaQueryManager.matches(
					{
						after: '2018-04-25T15:47:33-04:00',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true if media is after date', () => {
				const isMatch = MediaQueryManager.matches(
					{
						after: '2010-04-25T15:47:33-04:00',
					},
					DEFAULT_MEDIA
				);

				expect( isMatch ).toBe( true );
			} );
		} );
	} );

	describe( '#compare()', () => {
		describe( 'query.order', () => {
			test( 'should sort descending by default', () => {
				const sorted = [ { ID: 200 }, { ID: 400 } ].sort(
					makeComparator( {
						order_by: 'ID',
					} )
				);

				expect( sorted ).toEqual( [ { ID: 400 }, { ID: 200 } ] );
			} );

			test( 'should reverse order when specified as ascending', () => {
				const sorted = [ { ID: 400 }, { ID: 200 } ].sort(
					makeComparator( {
						order_by: 'ID',
						order: 'ASC',
					} )
				);

				expect( sorted ).toEqual( [ { ID: 200 }, { ID: 400 } ] );
			} );
		} );

		describe( 'query.order_by', () => {
			describe( 'date', () => {
				const olderMedia = {
					...DEFAULT_MEDIA,
					date: '2016-04-25T11:40:52-04:00',
				};

				const newerMedia = {
					...DEFAULT_MEDIA,
					ID: 152,
					date: '2016-04-25T15:47:33-04:00',
				};

				test( 'should order by date', () => {
					const sorted = [ olderMedia, newerMedia ].sort( makeComparator( {} ) );

					expect( sorted ).toEqual( [ newerMedia, olderMedia ] );
				} );
			} );

			describe( 'title', () => {
				const abMedia = {
					...DEFAULT_MEDIA,
					title: 'AB',
				};

				const aaMedia = {
					...DEFAULT_MEDIA,
					ID: 152,
					title: 'Aa',
				};

				test( 'should sort by title', () => {
					const sorted = [ aaMedia, abMedia ].sort(
						makeComparator( {
							order_by: 'title',
						} )
					);

					expect( sorted ).toEqual( [ abMedia, aaMedia ] );
				} );
			} );

			describe( 'ID', () => {
				test( 'should sort by ID', () => {
					const sorted = [ { ID: 200 }, { ID: 400 } ].sort(
						makeComparator( {
							order_by: 'ID',
						} )
					);

					expect( sorted ).toEqual( [ { ID: 400 }, { ID: 200 } ] );
				} );
			} );
		} );
	} );
} );
