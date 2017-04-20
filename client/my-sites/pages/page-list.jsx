/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	omit = require( 'lodash/omit' );
import {
	assign,
	forEach,
	groupBy,
	includes,
	map,
	reduce,
	sortBy,
} from 'lodash';

/**
 * Internal dependencies
 */
var PostListFetcher = require( 'components/post-list-fetcher' ),
	Page = require( './page' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	observe = require( 'lib/mixins/data-observe' ),
	EmptyContent = require( 'components/empty-content' ),
	NoResults = require( 'my-sites/no-results' ),
	actions = require( 'lib/posts/actions' ),
	Placeholder = require( './placeholder' ),
	mapStatus = require( 'lib/route' ).mapPostStatus;

import BlogPostsPage from './blog-posts-page';

// @TODO -- move this to a test file -- just getting started with some sample data for now
import testData from './test-pages.json';
const testPages = testData.posts;

// @TODO remove debug
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:pages-sorter' );

var PageList = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		context: React.PropTypes.object,
		search: React.PropTypes.string,
		sites: React.PropTypes.object,
		siteID: React.PropTypes.any
	},

	render: function() {
		return (
			<PostListFetcher
				type="page"
				siteID={ this.props.siteID }
				status={ mapStatus( this.props.status ) }
				search={ this.props.search }>
				<Pages
					{ ...omit( this.props, 'children' ) }
				/>
			</PostListFetcher>
		);
	}
} );

const sortByMenuOrder = list => sortBy( list, 'menu_order' );
const getParentId = page => page.parent && page.parent.ID;

const sortPagesHierarchically = pages => {
	const pageIds = map( pages, 'ID' );

	const pagesByParent = reduce( groupBy( pages, getParentId ), ( result, list, parentId ) => {
		if ( ! parentId || parentId === 'false' || ! includes( pageIds, parseInt( parentId, 10 ) ) ) {
			// If we don't have the parent in our list, promote the page to "top level"
			result.false = sortByMenuOrder( ( result.false || [] ).concat( list ) );
			return result;
		}

		result[ parentId ] = sortByMenuOrder( list );
		return result;
	}, {} );

	const sortedPages = [];

	const insertChildren = ( pageId, indentLevel ) => {
		const children = pagesByParent[ pageId ] || [];

		forEach( children, child => {
			sortedPages.push( assign( {}, child, { indentLevel } ) );
			insertChildren( child.ID, indentLevel + 1 );
		} );
	};

	forEach( pagesByParent.false, topLevelPage => {
		sortedPages.push( topLevelPage );
		insertChildren( topLevelPage.ID, 1 );
	} );

	return sortedPages;
};

var Pages = React.createClass( {

	displayName: 'Pages',

	mixins: [ infiniteScroll( 'fetchPages' ), observe( 'sites' ) ],

	propTypes: {
		context: React.PropTypes.object.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		loading: React.PropTypes.bool.isRequired,
		page: React.PropTypes.number.isRequired,
		posts: React.PropTypes.array.isRequired,
		search: React.PropTypes.string,
		siteID: React.PropTypes.any,
		sites: React.PropTypes.object.isRequired,
		trackScrollPage: React.PropTypes.func.isRequired,
		hasRecentError: React.PropTypes.bool.isRequired
	},

	getDefaultProps: function() {
		return {
			perPage: 20,
			loading: false,
			hasRecentError: false,
			lastPage: false,
			page: 0,
			posts: [],
			trackScrollPage: function() {}
		};
	},

	fetchPages: function( options ) {
		if ( this.props.loading || this.props.lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		actions.fetchNextPage();
	},

	_insertTimeMarkers: function( pages ) {
		var markedPages = [],
			now = this.moment(),
			lastMarker, buildMarker;

		buildMarker = function( pageDate ) {
			pageDate = this.moment( pageDate );
			var days = now.diff( pageDate, 'days' );
			if ( days <= 0 ) {
				return this.translate( 'Today' );
			}
			if ( days === 1 ) {
				return this.translate( 'Yesterday' );
			}
			return pageDate.from( now );
		}.bind( this );

		pages.forEach( function( page ) {
			var date = this.moment( page.date ),
				marker = buildMarker( date );
			if ( lastMarker !== marker ) {
				markedPages.push( <div key={ 'marker-' + date.unix() } className="page-list__header"><span className="noticon noticon-time" /> { marker } </div> );
			}
			lastMarker = marker;
			markedPages.push( page );
		}, this );

		return markedPages;
	},

	getNoContentMessage: function() {
		var attributes, newPageLink;

		if ( this.props.search ) {
			return <NoResults
				image="/calypso/images/pages/illustration-pages.svg"
				text={
					this.translate( 'No pages match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ this.props.search }</em>
						}
					} ) }
			/>;
		} else {
			newPageLink = this.props.siteID ? '/page/' + this.props.siteID : '/page';

			if ( this.props.hasRecentError ) {
				attributes = {
					title: this.translate( 'Oh, no! We couldn\'t fetch your pages.' ),
					line: this.translate( 'Please check your internet connection.' )
				};
			} else {
				const status = this.props.status || 'published';
				switch ( status ) {
					case 'drafts':
						attributes = {
							title: this.translate( 'You don\'t have any drafts.' ),
							line: this.translate( 'Would you like to create one?' ),
							action: this.translate( 'Start a Page' ),
							actionURL: newPageLink
						};
						break;
					case 'scheduled':
						attributes = {
							title: this.translate( 'You don\'t have any scheduled pages yet.' ),
							line: this.translate( 'Would you like to create one?' ),
							action: this.translate( 'Start a Page' ),
							actionURL: newPageLink
						};
						break;
					case 'trashed':
						attributes = {
							title: this.translate( 'You don\'t have any pages in your trash folder.' ),
							line: this.translate( 'Everything you write is solid gold.' )
						};
						break;
					default:
						attributes = {
							title: this.translate( 'You haven\'t published any pages yet.' ),
							line: this.translate( 'Would you like to publish your first page?' ),
							action: this.translate( 'Start a Page' ),
							actionURL: newPageLink
						};
				}
			}
		}

		attributes.illustration = '/calypso/images/pages/illustration-pages.svg';
		attributes.illustrationWidth = 150;

		return <EmptyContent
			title={ attributes.title }
			line={ attributes.line }
			action={ attributes.action }
			actionURL={ attributes.actionURL }
			illustration={ attributes.illustration }
			illustrationWidth={ attributes.illustrationWidth }
		/>;
	},

	addLoadingRows: function( rows, count ) {
		var i;
		for ( i = 0; i < count; i++ ) {
			if ( i % 4 === 0 ) {
				rows.push( <Placeholder.Marker key={ 'placeholder-marker-' + i } /> );
			}
			rows.push( <Placeholder.Page key={ 'placeholder-page-' + i } multisite={ this.props.siteID === false } /> );
		}
	},

	render: function() {
		var pages = this.props.posts,
			rows = [];

		debug( sortPagesHierarchically( testPages ) );

		// pages have loaded, sites have loaded, and we have a site instance or are viewing all-sites
		if ( pages.length && this.props.sites.initialized ) {
			if ( ! this.props.search ) {
				// we're listing in reverse chrono. use the markers.
				pages = this._insertTimeMarkers( pages );
			}
			rows = pages.map( function( page ) {
				if ( ! ( 'site_ID' in page ) ) {
					return page;
				}
					// Get the site the page belongs to
				var site = this.props.sites.getSite( page.site_ID );

					// Render each page
				return (
						<Page key={ 'page-' + page.global_ID } page={ page } site={ site } multisite={ this.props.siteID === false } />
					);
			}, this );

			if ( this.props.loading ) {
				this.addLoadingRows( rows, 1 );
			}

			const site = this.props.sites.getSelectedSite();
			const status = this.props.status || 'published';

			if ( site && status === 'published' ) {
				rows.push(
					<BlogPostsPage
						key="blog-posts-page"
						site={ site }
					/>
				);
			}
		} else if ( ( ! this.props.loading ) && this.props.sites.initialized ) {
			rows.push( <div key="page-list-no-results">{ this.getNoContentMessage() }</div> );
		} else {
			this.addLoadingRows( rows, 1 );
		}

		return (
			<div id="pages" className="page-list">
				{ rows }
				{ this.props.lastPage && pages.length ? <div className="infinite-scroll-end" /> : null }
			</div>
		);
	}
} );

module.exports = PageList;
