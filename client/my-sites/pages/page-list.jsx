/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

import { connect } from 'react-redux';
import {
	isEmpty,
	omit,
} from 'lodash';

/**
 * Internal dependencies
 */
var PostListFetcher = require( 'components/post-list-fetcher' ),
	Page = require( './page' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	EmptyContent = require( 'components/empty-content' ),
	NoResults = require( 'my-sites/no-results' ),
	actions = require( 'lib/posts/actions' ),
	Placeholder = require( './placeholder' ),
	mapStatus = require( 'lib/route' ).mapPostStatus,
	sortPagesHierarchically = require( './helpers' ).sortPagesHierarchically;

import BlogPostsPage from './blog-posts-page';
import {
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';

var PageList = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		context: React.PropTypes.object,
		search: React.PropTypes.string,
		hasSites: React.PropTypes.bool.isRequired,
		site: React.PropTypes.object,
		siteId: React.PropTypes.any
	},

	render: function() {
		return (
			<PostListFetcher
				type="page"
				number={ 100 }
				siteID={ this.props.siteId }
				status={ mapStatus( this.props.status ) }
				search={ this.props.search }>
				<Pages
					{ ...omit( this.props, 'children' ) }
				/>
			</PostListFetcher>
		);
	}
} );

var Pages = React.createClass( {

	displayName: 'Pages',

	mixins: [ infiniteScroll( 'fetchPages' ) ],

	propTypes: {
		context: React.PropTypes.object.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		loading: React.PropTypes.bool.isRequired,
		page: React.PropTypes.number.isRequired,
		posts: React.PropTypes.array.isRequired,
		search: React.PropTypes.string,
		siteId: React.PropTypes.any,
		hasSites: React.PropTypes.bool.isRequired,
		trackScrollPage: React.PropTypes.func.isRequired,
		hasRecentError: React.PropTypes.bool.isRequired
	},

	getDefaultProps: function() {
		return {
			perPage: 100,
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
			const { site, siteId } = this.props;
			const sitePart = site && site.slug || siteId;
			newPageLink = this.props.siteId ? '/page/' + sitePart : '/page';

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
			rows.push( <Placeholder.Page key={ 'placeholder-page-' + i } multisite={ ! this.props.site } /> );
		}
	},

	renderLoading: function() {
		const rows = [];
		this.addLoadingRows( rows, 1 );

		return (
			<div id="pages" className="pages__page-list">
				{ rows }
			</div>
		);
	},

	renderPagesList: function( { pages } ) {
		const { site } = this.props;
		const status = this.props.status || 'published';

		// Pages only display hierarchically for published pages on single-sites when
		// there are 100 or fewer pages and no more pages to load (last page).
		// Pages are not displayed hierarchically for search.
		if ( site && status === 'published' &&
			this.props.lastPage && pages.length <= 100 &&
			! this.props.search ) {
			return this.renderHierarchical( { pages, site } );
		}

		return this.renderChronological( { pages, site } );
	},

	renderHierarchical: function( { pages, site } ) {
		pages = sortPagesHierarchically( pages );
		const rows = pages.map( function( page ) {
			return (
				<Page key={ 'page-' + page.global_ID } page={ page } site={ site }
					multisite={ false } hierarchical={ true } hierarchyLevel={ page.indentLevel || 0 } />
			);
		}, this );

		return (
			<div id="pages" className="pages__page-list">
				<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
				{ rows }
			</div>
		);
	},

	renderChronological: function( { pages, site } ) {
		if ( ! this.props.search ) {
			// we're listing in reverse chrono. use the markers.
			pages = this._insertTimeMarkers( pages );
		}
		const rows = pages.map( function( page ) {
			if ( ! ( 'site_ID' in page ) ) {
				return page;
			}

			// Render each page
			return (
				<Page key={ 'page-' + page.global_ID } page={ page } multisite={ this.props.siteID === false } />
			);
		}, this );

		if ( this.props.loading ) {
			this.addLoadingRows( rows, 1 );
		}

		const blogPostsPage = ( site && status === 'published' ) && (
			<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
		);

		return (
			<div id="pages" className="pages__page-list">
				{ blogPostsPage }
				{ rows }
				{ this.props.lastPage && pages.length ? <div className="infinite-scroll-end" /> : null }
			</div>
		);
	},

	renderNoContent: function() {
		return (
			<div id="pages" className="pages__page-list">
				<div key="page-list-no-results">{ this.getNoContentMessage() }</div>
			</div>
		);
	},

	render: function() {
		const {
			hasSites,
			loading,
			posts,
		} = this.props;

		if ( posts.length && hasSites ) {
			return this.renderPagesList( { pages: posts } );
		}

		if ( ( ! loading ) && hasSites ) {
			return this.renderNoContent();
		}

		return this.renderLoading();
	},

} );

const mapState = state => {
	return {
		hasSites: ! isEmpty( state.sites.items ),
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
	};
};

export default connect( mapState )( PageList );
