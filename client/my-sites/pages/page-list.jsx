/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import PostListFetcher from 'components/post-list-fetcher';
import Page from './page';
import infiniteScroll from 'lib/mixins/infinite-scroll';
import EmptyContent from 'components/empty-content';
import NoResults from 'my-sites/no-results';
import actions from 'lib/posts/actions';
import Placeholder from './placeholder';
import { mapPostStatus as mapStatus } from 'lib/route';
import { sortPagesHierarchically } from './helpers';
import BlogPostsPage from './blog-posts-page';
import {
	hasInitializedSites,
} from 'state/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';

const PageList = ( props ) => (
	<PostListFetcher
		type="page"
		number={ 100 }
		siteId={ props.siteId }
		status={ mapStatus( props.status ) }
		search={ props.search }>
		<Pages
			{ ...omit( props, 'children' ) }
		/>
	</PostListFetcher>
);

PageList.propTypes = {
	context: PropTypes.object,
	search: PropTypes.string,
	hasSites: PropTypes.bool.isRequired,
	site: PropTypes.object,
	siteId: PropTypes.any
};

const Pages = localize( React.createClass( {

	displayName: 'Pages',

	mixins: [ infiniteScroll( 'fetchPages' ) ],

	propTypes: {
		context: PropTypes.object.isRequired,
		lastPage: PropTypes.bool.isRequired,
		loading: PropTypes.bool.isRequired,
		page: PropTypes.number.isRequired,
		posts: PropTypes.array.isRequired,
		search: PropTypes.string,
		siteId: PropTypes.any,
		hasSites: PropTypes.bool.isRequired,
		trackScrollPage: PropTypes.func.isRequired,
		hasRecentError: PropTypes.bool.isRequired
	},

	getDefaultProps() {
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

	fetchPages( options ) {
		if ( this.props.loading || this.props.lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		actions.fetchNextPage();
	},

	_insertTimeMarkers( pages ) {
		const markedPages = [],
			now = this.moment();
		let lastMarker;

		const buildMarker = function( pageDate ) {
			pageDate = this.moment( pageDate );
			const days = now.diff( pageDate, 'days' );
			if ( days <= 0 ) {
				return this.props.translate( 'Today' );
			}
			if ( days === 1 ) {
				return this.props.translate( 'Yesterday' );
			}
			return pageDate.from( now );
		}.bind( this );

		pages.forEach( function( page ) {
			const date = this.moment( page.date ),
				marker = buildMarker( date );
			if ( lastMarker !== marker ) {
				markedPages.push(
					<div key={ 'marker-' + date.unix() } className="page-list__header">
						<span className="noticon noticon-time" /> { marker }
					</div>
				);
			}
			lastMarker = marker;
			markedPages.push( page );
		}, this );

		return markedPages;
	},

	getNoContentMessage() {
		const { search, translate } = this.props;

		if ( search ) {
			return (
				<NoResults
					image="/calypso/images/pages/illustration-pages.svg"
					text={
						translate( 'No pages match your search for {{searchTerm/}}.', {
							components: {
								searchTerm: <em>{ search }</em>
							}
						} ) }
				/>
			);
		}

		const { site, siteId } = this.props;
		const sitePart = site && site.slug || siteId;
		const newPageLink = this.props.siteId ? '/page/' + sitePart : '/page';
		let attributes;

		if ( this.props.hasRecentError ) {
			attributes = {
				title: translate( 'Oh, no! We couldn\'t fetch your pages.' ),
				line: translate( 'Please check your internet connection.' )
			};
		} else {
			const status = this.props.status || 'published';
			switch ( status ) {
				case 'drafts':
					attributes = {
						title: translate( 'You don\'t have any drafts.' ),
						line: translate( 'Would you like to create one?' ),
						action: translate( 'Start a Page' ),
						actionURL: newPageLink
					};
					break;
				case 'scheduled':
					attributes = {
						title: translate( 'You don\'t have any scheduled pages yet.' ),
						line: translate( 'Would you like to create one?' ),
						action: translate( 'Start a Page' ),
						actionURL: newPageLink
					};
					break;
				case 'trashed':
					attributes = {
						title: translate( 'You don\'t have any pages in your trash folder.' ),
						line: translate( 'Everything you write is solid gold.' )
					};
					break;
				default:
					attributes = {
						title: translate( 'You haven\'t published any pages yet.' ),
						line: translate( 'Would you like to publish your first page?' ),
						action: translate( 'Start a Page' ),
						actionURL: newPageLink
					};
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

	addLoadingRows( rows, count ) {
		for ( let i = 0; i < count; i++ ) {
			if ( i % 4 === 0 ) {
				rows.push( <Placeholder.Marker key={ 'placeholder-marker-' + i } /> );
			}
			rows.push( <Placeholder.Page key={ 'placeholder-page-' + i } multisite={ ! this.props.site } /> );
		}
	},

	renderLoading() {
		const rows = [];
		this.addLoadingRows( rows, 1 );

		return (
			<div id="pages" className="pages__page-list">
				{ rows }
			</div>
		);
	},

	renderPagesList( { pages } ) {
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

	renderHierarchical( { pages, site } ) {
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

	renderChronological( { pages, site } ) {
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
				<Page key={ 'page-' + page.global_ID } page={ page } multisite={ this.props.siteId === false } />
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

	renderNoContent() {
		return (
			<div id="pages" className="pages__page-list">
				<div key="page-list-no-results">{ this.getNoContentMessage() }</div>
			</div>
		);
	},

	render() {
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

} ) );

const mapState = ( state ) => ( {
	hasSites: hasInitializedSites( state ),
	site: getSelectedSite( state ),
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapState )( PageList );
