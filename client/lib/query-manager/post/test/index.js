/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostQueryManager from '../';

/**
 * Constants
 */
const DEFAULT_POST = {
	ID: 144,
	site_ID: 77203074,
	author: {
		ID: 73705554,
		login: 'testonesite2014'
	},
	date: '2016-04-25T15:47:33-04:00',
	modified: '2016-04-29T11:53:53-04:00',
	title: 'Ribs & Chicken',
	content: 'Are delicious',
	status: 'publish',
	sticky: false,
	parent: false,
	type: 'post',
	discussion: {
		comments_open: true,
		comment_status: 'open',
		pings_open: true,
		ping_status: 'open',
		comment_count: 0
	},
	tags: {
		Tagged: {
			ID: 17695,
			name: 'Tagged!',
			slug: 'tagged'
		}
	},
	categories: {
		'Categorized!': {
			ID: 5519,
			name: 'Categorized!',
			slug: 'categorized'
		}
	},
	terms: {
		post_tag: {
			Tagged: {
				ID: 17695,
				name: 'Tagged!',
				slug: 'tagged'
			}
		},
		category: {
			'Categorized!': {
				ID: 5519,
				name: 'Categorized!',
				slug: 'categorized'
			}
		},
		genre: {
			Fiction: {
				ID: 5102,
				name: 'Fiction',
				slug: 'fiction'
			},
			'Sci-Fi': {
				ID: 5102,
				name: 'Sci-Fi',
				slug: 'sci-fi'
			}
		}
	},
	metadata: [
		{
			id: '22573',
			key: '_rest_api_published',
			value: '1'
		}
	]
};

describe( 'PostQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new PostQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.search', () => {
			it( 'should return false for a non-matching search', () => {
				const isMatch = PostQueryManager.matches( {
					search: 'disgusting'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for a matching title search', () => {
				const isMatch = PostQueryManager.matches( {
					search: 'Ribs'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a falsey title search', () => {
				const isMatch = PostQueryManager.matches( {
					search: null
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a matching content search', () => {
				const isMatch = PostQueryManager.matches( {
					search: 'delicious'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = PostQueryManager.matches( {
					search: 'ribs'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should separately test title and content fields', () => {
				const isMatch = PostQueryManager.matches( {
					search: 'ChickenAre'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );
		} );

		context( 'query.after', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = PostQueryManager.matches( {
					after: '2014'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if post is not after date', () => {
				const isMatch = PostQueryManager.matches( {
					after: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post is after date', () => {
				const isMatch = PostQueryManager.matches( {
					after: '2014-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.before', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = PostQueryManager.matches( {
					before: '2018'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if post is not before date', () => {
				const isMatch = PostQueryManager.matches( {
					before: '2014-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post is before date', () => {
				const isMatch = PostQueryManager.matches( {
					before: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.modified_after', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = PostQueryManager.matches( {
					modified_after: '2014'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if post is not modified after date', () => {
				const isMatch = PostQueryManager.matches( {
					modified_after: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post is modified after date', () => {
				const isMatch = PostQueryManager.matches( {
					modified_after: '2014-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.modified_before', () => {
			it( 'should return false if query is not ISO 8601', () => {
				const isMatch = PostQueryManager.matches( {
					modified_before: '2018'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if post is not modified before date', () => {
				const isMatch = PostQueryManager.matches( {
					modified_before: '2014-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post is modified before date', () => {
				const isMatch = PostQueryManager.matches( {
					modified_before: '2018-04-25T15:47:33-04:00'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.tag', () => {
			it( 'should return false if post does not include tag', () => {
				const isMatch = PostQueryManager.matches( {
					tag: 'Nottag'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false on a partial match', () => {
				const isMatch = PostQueryManager.matches( {
					tag: 'agg'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post includes tag by name', () => {
				const isMatch = PostQueryManager.matches( {
					tag: 'Tagged!'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if post includes tag by slug', () => {
				const isMatch = PostQueryManager.matches( {
					tag: 'tagged'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = PostQueryManager.matches( {
					tag: 'taGgEd'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.category', () => {
			it( 'should return false if post does not include category', () => {
				const isMatch = PostQueryManager.matches( {
					category: 'Notcategory'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false on a partial match', () => {
				const isMatch = PostQueryManager.matches( {
					category: 'egori'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post includes category by name', () => {
				const isMatch = PostQueryManager.matches( {
					category: 'Categorized!'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if post includes category by slug', () => {
				const isMatch = PostQueryManager.matches( {
					category: 'categorized'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = PostQueryManager.matches( {
					category: 'caTegoriZed'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.term', () => {
			it( 'should return false if post does not include term', () => {
				const isMatch = PostQueryManager.matches( {
					term: {
						genre: 'non-fiction'
					}
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if one but not both term slug queries match', () => {
				const isMatch = PostQueryManager.matches( {
					term: {
						genre: 'fiction',
						category: 'notcategory'
					}
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if post includes term by slug', () => {
				const isMatch = PostQueryManager.matches( {
					term: {
						genre: 'fiction'
					}
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if post includes one of comma-separated term slugs', () => {
				const isMatch = PostQueryManager.matches( {
					term: {
						genre: 'fiction,non-fiction'
					}
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if post includes both of comma-separated term slugs', () => {
				const isMatch = PostQueryManager.matches( {
					term: {
						genre: 'fiction,sci-fi'
					}
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.type', () => {
			it( 'should return true if type is any', () => {
				const post = Object.assign( {}, DEFAULT_POST, {
					type: 'cpt-book'
				} );
				const isMatch = PostQueryManager.matches( {
					type: 'any'
				}, post );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if type does not match', () => {
				const isMatch = PostQueryManager.matches( {
					type: 'page'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if type matches', () => {
				const isMatch = PostQueryManager.matches( {
					type: 'post'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.parent_id', () => {
			it( 'should return false if parent does not match', () => {
				const isMatch = PostQueryManager.matches( {
					parent_id: 10
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if numeric parent matches', () => {
				const post = Object.assign( {}, DEFAULT_POST, {
					parent: 10
				} );
				const isMatch = PostQueryManager.matches( {
					parent_id: 10
				}, post );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if object parent matches', () => {
				const post = Object.assign( {}, DEFAULT_POST, {
					parent: {
						ID: 10
					}
				} );
				const isMatch = PostQueryManager.matches( {
					parent_id: 10
				}, post );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.exclude', () => {
			it( 'should return false if ID matches single exclude', () => {
				const isMatch = PostQueryManager.matches( {
					exclude: 144
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if ID matches array of excludes', () => {
				const isMatch = PostQueryManager.matches( {
					exclude: [ 144, 152 ]
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if ID does not match single exclude', () => {
				const isMatch = PostQueryManager.matches( {
					exclude: 152
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if ID does not match array of excludes', () => {
				const isMatch = PostQueryManager.matches( {
					exclude: [ 152, 160 ]
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.sticky', () => {
			const stickyPost = Object.assign( {}, DEFAULT_POST, {
				sticky: true
			} );

			it( 'should return true if "include" and sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'include'
				}, stickyPost );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if "include" and not sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'include'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if "require" and sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'require'
				}, stickyPost );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if "require" and not sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'require'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if "exclude" and sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'exclude'
				}, stickyPost );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if "exclude" and not sticky', () => {
				const isMatch = PostQueryManager.matches( {
					sticky: 'exclude'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.author', () => {
			const postWithScalarAuthor = Object.assign( {}, DEFAULT_POST, {
				author: 73705554
			} );

			it( 'should return false if author does not match by nested object', () => {
				const isMatch = PostQueryManager.matches( {
					author: 73705672
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if author matches by nested object', () => {
				const isMatch = PostQueryManager.matches( {
					author: 73705554
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if author does not match by scalar value', () => {
				const isMatch = PostQueryManager.matches( {
					author: 73705672
				}, postWithScalarAuthor );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if author matches by scalar value', () => {
				const isMatch = PostQueryManager.matches( {
					author: 73705554
				}, postWithScalarAuthor );

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'query.status', () => {
			it( 'should return false if status is "any"', () => {
				const isMatch = PostQueryManager.matches( {
					status: 'any'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if status does not match', () => {
				const isMatch = PostQueryManager.matches( {
					status: 'draft'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if status matches', () => {
				const isMatch = PostQueryManager.matches( {
					status: 'publish'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if none of comma-separated values match', () => {
				const isMatch = PostQueryManager.matches( {
					status: 'draft,trash'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if one of comma-separated values match', () => {
				const isMatch = PostQueryManager.matches( {
					status: 'draft,publish'
				}, DEFAULT_POST );

				expect( isMatch ).to.be.true;
			} );

			it( 'should gracefully handle non-string search values', () => {
				const isMatch = PostQueryManager.matches( {
					status: undefined
				}, DEFAULT_POST );

				expect( isMatch ).to.be.false;
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
					{ ID: 200 },
					{ ID: 400 }
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
				const olderPost = Object.assign( {}, DEFAULT_POST, {
					date: '2016-04-25T11:40:52-04:00'
				} );

				const newerPost = Object.assign( {}, DEFAULT_POST, {
					ID: 152,
					date: '2016-04-25T15:47:33-04:00'
				} );

				it( 'should order by date', () => {
					const sorted = [
						olderPost,
						newerPost
					].sort( manager.compare.bind( manager, {} ) );

					expect( sorted ).to.eql( [
						newerPost,
						olderPost
					] );
				} );
			} );

			context( 'modified', () => {
				const olderPost = Object.assign( {}, DEFAULT_POST, {
					modified: '2016-04-25T11:40:52-04:00'
				} );

				const newerPost = Object.assign( {}, DEFAULT_POST, {
					ID: 152,
					modified: '2016-04-25T15:47:33-04:00'
				} );

				it( 'should order by modified', () => {
					const sorted = [
						olderPost,
						newerPost
					].sort( manager.compare.bind( manager, {
						order_by: 'modified'
					} ) );

					expect( sorted ).to.eql( [
						newerPost,
						olderPost
					] );
				} );
			} );

			context( 'title', () => {
				const aPost = Object.assign( {}, DEFAULT_POST, {
					title: 'a'
				} );

				const zPost = Object.assign( {}, DEFAULT_POST, {
					ID: 152,
					title: 'z'
				} );

				it( 'should sort by title', () => {
					const sorted = [
						aPost,
						zPost
					].sort( manager.compare.bind( manager, {
						order_by: 'title'
					} ) );

					expect( sorted ).to.eql( [
						zPost,
						aPost
					] );
				} );
			} );

			context( 'comment_count', () => {
				const unpopularPost = Object.assign( {}, DEFAULT_POST, {
					discussion: {
						comment_count: 2
					}
				} );

				const popularPost = Object.assign( {}, DEFAULT_POST, {
					ID: 152,
					discussion: {
						comment_count: 97
					}
				} );

				it( 'should sort by comment count', () => {
					const sorted = [
						unpopularPost,
						popularPost
					].sort( manager.compare.bind( manager, {
						order_by: 'comment_count'
					} ) );

					expect( sorted ).to.eql( [
						popularPost,
						unpopularPost
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
