/**
 * External dependencies
 */
import { expect } from 'chai';

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
	exif: {}
};

describe( 'MediaQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new MediaQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.search', () => {
			it( 'should return false for a non-matching search', () => {
				const isMatch = manager.matches( {
					search: 'Cars'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for an empty search', () => {
				const isMatch = manager.matches( {
					search: ''
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a matching title search', () => {
				const isMatch = manager.matches( {
					search: 'lower'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = manager.matches( {
					search: 'fLoWeR'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.mime_type', () => {
			it( 'should return true for an empty mime type', () => {
				const isMatch = manager.matches( {
					mime_type: ''
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true an exact match', () => {
				const isMatch = manager.matches( {
					mime_type: 'image/gif'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for mime subgroup exact match', () => {
				const isMatch = manager.matches( {
					mime_type: 'image'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for mime subgroup exact match with trailing slash', () => {
				const isMatch = manager.matches( {
					mime_type: 'image/'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false for mime subgroup partial match', () => {
				const isMatch = manager.matches( {
					mime_type: 'imag'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false for mime group partial match', () => {
				const isMatch = manager.matches( {
					mime_type: 'image/gi'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for wildcard match', () => {
				const isMatch = manager.matches( {
					mime_type: '%'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false for mime subgroup wildcard match', () => {
				const isMatch = manager.matches( {
					mime_type: '%/gif'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for mime group wildcard match', () => {
				const isMatch = manager.matches( {
					mime_type: 'image/%'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false for mime subgroup partial wildcard match', () => {
				const isMatch = manager.matches( {
					mime_type: 'ima%/%'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false for mime group partial wildcard match', () => {
				const isMatch = manager.matches( {
					mime_type: 'image/gi%'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );
		} );

		context( 'query.post_ID', () => {
			it( 'should return false if post ID does not match', () => {
				const isMatch = manager.matches( {
					post_ID: 0
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post ID matches', () => {
				const isMatch = manager.matches( {
					post_ID: 41
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.before', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = manager.matches( {
					before: '2018'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if media is not before date', () => {
				const isMatch = manager.matches( {
					before: '2010-04-25T15:47:33-04:00'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if media is before date', () => {
				const isMatch = manager.matches( {
					before: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.after', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = manager.matches( {
					after: '2010'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if media is not after date', () => {
				const isMatch = manager.matches( {
					after: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if media is after date', () => {
				const isMatch = manager.matches( {
					after: '2010-04-25T15:47:33-04:00'
				}, DEFAULT_MEDIA );

				expect( isMatch ).to.be.true;
			} );
		} );
	} );

	describe( '#compare()', () => {
		context( 'query.order', () => {
			it( 'should sort descending by default', () => {
				const sorted = [
					{ ID: 200 },
					{ ID: 400 }
				].sort( manager.compare.bind( manager, {
					order_by: 'ID'
				} ) );

				expect( sorted ).to.eql( [
					{ ID: 400 },
					{ ID: 200 }
				] );
			} );

			it( 'should reverse order when specified as ascending', () => {
				const sorted = [
					{ ID: 400 },
					{ ID: 200 }
				].sort( manager.compare.bind( manager, {
					order_by: 'ID',
					order: 'ASC'
				} ) );

				expect( sorted ).to.eql( [
					{ ID: 200 },
					{ ID: 400 }
				] );
			} );
		} );

		context( 'query.order_by', () => {
			context( 'date', () => {
				const olderMedia = {
					...DEFAULT_MEDIA,
					date: '2016-04-25T11:40:52-04:00'
				};

				const newerMedia = {
					...DEFAULT_MEDIA,
					ID: 152,
					date: '2016-04-25T15:47:33-04:00'
				};

				it( 'should order by date', () => {
					const sorted = [
						olderMedia,
						newerMedia
					].sort( manager.compare.bind( manager, {} ) );

					expect( sorted ).to.eql( [
						newerMedia,
						olderMedia
					] );
				} );
			} );

			context( 'title', () => {
				const abMedia = {
					...DEFAULT_MEDIA,
					title: 'AB'
				};

				const aaMedia = {
					...DEFAULT_MEDIA,
					ID: 152,
					title: 'Aa'
				};

				it( 'should sort by title', () => {
					const sorted = [
						aaMedia,
						abMedia
					].sort( manager.compare.bind( manager, {
						order_by: 'title'
					} ) );

					expect( sorted ).to.eql( [
						abMedia,
						aaMedia
					] );
				} );
			} );

			context( 'ID', () => {
				it( 'should sort by ID', () => {
					const sorted = [
						{ ID: 200 },
						{ ID: 400 }
					].sort( manager.compare.bind( manager, {
						order_by: 'ID'
					} ) );

					expect( sorted ).to.eql( [
						{ ID: 400 },
						{ ID: 200 }
					] );
				} );
			} );
		} );
	} );
} );
