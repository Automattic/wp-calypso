import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight, isEqual, size, without } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import ListEnd from 'calypso/components/list-end';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import SectionHeader from 'calypso/components/section-header';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import NoResults from 'calypso/my-sites/no-results';
import {
	getPostsForQueryIgnoringPage,
	isRequestingPostsForQuery,
	isPostsLastPageForQuery,
} from 'calypso/state/posts/selectors';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { getSite, getSiteFrontPage, getSiteFrontPageType } from 'calypso/state/sites/selectors';
import BlogPostsPage from './blog-posts-page';
import { sortPagesHierarchically } from './helpers';
import Page from './page';
import Placeholder from './placeholder';
import VirtualPage from './virtual-page';

class Pages extends Component {
	static propTypes = {
		incrementPage: PropTypes.func.isRequired,
		lastPage: PropTypes.bool,
		loading: PropTypes.bool.isRequired,
		page: PropTypes.number.isRequired,
		pages: PropTypes.array.isRequired,
		search: PropTypes.string,
		site: PropTypes.object,
		siteId: PropTypes.any,
		hasSites: PropTypes.bool.isRequired,
		trackScrollPage: PropTypes.func.isRequired,
		query: PropTypes.object,
		showPublishedStatus: PropTypes.bool,
		homepageType: PropTypes.string,
		blockEditorSettings: PropTypes.any,
		areBlockEditorSettingsLoading: PropTypes.bool,
		isFSEActive: PropTypes.bool,
		isFSEActiveLoading: PropTypes.bool,
	};

	static defaultProps = {
		loading: false,
		lastPage: false,
		page: 0,
		pages: [],
		trackScrollPage: function () {},
		query: {},
		showPublishedStatus: false,
	};

	state = {
		pages: this.props.pages,
		shadowItems: {},
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.pages !== this.props.pages &&
			( size( this.state.shadowItems ) === 0 || ! isEqual( nextProps.query, this.props.query ) )
		) {
			this.setState( { pages: nextProps.pages, shadowItems: {} } );
		}
	}

	trackNewpageClick = () => {
		recordTracksEvent( 'calypso_pages_addnewpage_click', { blog_id: this.props.siteId } );
	};

	fetchPages = ( options ) => {
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		this.props.incrementPage();
	};

	updateShadowStatus = ( globalID, shadowStatus ) =>
		new Promise( ( resolve ) =>
			this.setState( ( state, props ) => {
				if ( shadowStatus ) {
					// add or update the `globalID` key in the `shadowItems` map
					return {
						shadowItems: {
							...state.shadowItems,
							[ globalID ]: shadowStatus,
						},
					};
				}

				// remove `globalID` from the `shadowItems` map
				const newShadowItems = without( state.shadowItems, globalID );
				const newState = {
					shadowItems: newShadowItems,
				};

				// if the last shadow item just got removed, start showing the up-to-date post
				// list as specified by props.
				if ( size( newShadowItems ) === 0 ) {
					newState.pages = props.pages;
				}

				return newState;
			}, resolve )
		);

	getNoContentMessage() {
		const { newPageLink, query, translate } = this.props;
		const { search, status } = query;

		if ( search ) {
			return (
				<NoResults
					image="/calypso/images/pages/illustration-pages.svg"
					text={ translate( 'No pages match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ search }</em>,
						},
					} ) }
				/>
			);
		}

		let attributes;

		switch ( status ) {
			case 'draft,pending':
				attributes = {
					title: translate( "You don't have any drafts." ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a page' ),
					actionURL: newPageLink,
				};
				break;
			case 'future':
				attributes = {
					title: translate( "You don't have any scheduled pages yet." ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a page' ),
					actionURL: newPageLink,
				};
				break;
			case 'trash':
				attributes = {
					title: translate( "You don't have any pages in your trash folder." ),
					line: translate( 'Everything you write is solid gold.' ),
				};
				break;
			default:
				attributes = {
					title: translate( "You haven't published any pages yet." ),
					line: translate( 'Would you like to publish your first page?' ),
					action: translate( 'Start a page' ),
					actionURL: newPageLink,
				};
		}

		attributes.illustration = '/calypso/images/pages/illustration-pages.svg';
		attributes.illustrationWidth = 150;

		return (
			<EmptyContent
				title={ attributes.title }
				line={ attributes.line }
				action={ attributes.action }
				actionURL={ attributes.actionURL }
				illustration={ attributes.illustration }
				illustrationWidth={ attributes.illustrationWidth }
			/>
		);
	}

	showBlogPostsPage() {
		const { site, homepageType, homepageId, isFSEActive } = this.props;
		const { search, status } = this.props.query;

		return (
			/** Blog posts page is for themes that don't support FSE */
			! isFSEActive &&
			site &&
			( homepageType === 'posts' || ( homepageType === 'page' && ! homepageId ) ) &&
			/** Under the "Published" tab */
			status === 'publish,private' &&
			/** Without any search term */
			! search
		);
	}

	/**
	 * Show the virtual homepage
	 */
	showVirtualHomepage() {
		const { site, homepageType, homepageId, blockEditorSettings, isFSEActive, translate } =
			this.props;
		const { search, status } = this.props.query;

		return (
			/** Virtual homepage is for themes that support FSE */
			isFSEActive &&
			site &&
			( homepageType === 'posts' || ( homepageType === 'page' && ! homepageId ) ) &&
			blockEditorSettings?.home_template &&
			/** Under the "Published" tab without any search term or the search term is matched */
			( ( status === 'publish,private' && ! search ) ||
				( search && translate( 'Homepage' ).toLowerCase().includes( search.toLowerCase() ) ) )
		);
	}

	addLoadingRows( rows, count ) {
		for ( let i = 0; i < count; i++ ) {
			if ( i % 4 === 0 ) {
				rows.push( <Placeholder.Marker key={ 'placeholder-marker-' + i } /> );
			}
			rows.push(
				<Placeholder.Page key={ 'placeholder-page-' + i } multisite={ ! this.props.site } />
			);
		}
	}

	renderLoading() {
		const rows = [];
		this.addLoadingRows( rows, 1 );

		return (
			<div id="pages" className="pages__page-list">
				{ rows }
			</div>
		);
	}

	renderListEnd() {
		return this.props.lastPage && ! this.props.loading ? <ListEnd /> : null;
	}

	renderSectionHeader() {
		const { newPageLink, translate } = this.props;

		return (
			<SectionHeader label={ translate( 'Pages' ) }>
				<Button
					primary
					compact
					className="pages__add-page"
					href={ newPageLink }
					onClick={ this.trackNewpageClick }
				>
					{ translate( 'Add new page' ) }
				</Button>
			</SectionHeader>
		);
	}

	renderBlogPostsPage() {
		const { site } = this.props;

		if ( ! this.showBlogPostsPage() ) {
			return null;
		}

		return <BlogPostsPage key="blog-posts-page" site={ site } />;
	}

	renderVirtualHomePage() {
		const { site, blockEditorSettings, translate } = this.props;

		if ( ! this.showVirtualHomepage() ) {
			return null;
		}

		return (
			<VirtualPage
				key="virtual-home-page"
				site={ site }
				id={ blockEditorSettings?.home_template?.postId }
				type={ blockEditorSettings?.home_template?.postType }
				/** We'd prefer to call it Homepage no matter which template is in use */
				title={ translate( 'Homepage' ) }
				previewUrl={ site.URL }
				isHomepage
			/>
		);
	}

	renderPagesList( { pages } ) {
		const { site, lastPage, query, showPublishedStatus } = this.props;

		// Pages only display hierarchically for published pages on single-sites when
		// there are 50 or fewer pages and no more pages to load (last page).
		// Pages are not displayed hierarchically for search.
		const showHierarchical =
			site &&
			query.status === 'publish,private' &&
			lastPage &&
			pages.length <= 50 &&
			! query.search;

		return showHierarchical
			? this.renderHierarchical( { pages, site, showPublishedStatus } )
			: this.renderChronological( { pages, site, showPublishedStatus } );
	}

	renderHierarchical( { pages, site, showPublishedStatus } ) {
		pages = sortPagesHierarchically( pages, this.props.homepageId );
		const rows = pages.map( function ( page ) {
			return (
				<Page
					key={ 'page-' + page.global_ID }
					shadowStatus={ this.state.shadowItems[ page.global_ID ] }
					onShadowStatusChange={ this.updateShadowStatus }
					page={ page }
					multisite={ false }
					hierarchical
					hierarchyLevel={ page.indentLevel || 0 }
					showPublishedStatus={ showPublishedStatus }
				/>
			);
		}, this );

		return (
			<div id="pages" className="pages__page-list">
				{ this.renderBlogPostsPage() }
				{ this.renderVirtualHomePage() }
				{ site && this.renderSectionHeader() }
				{ rows }
				{ this.renderListEnd() }
			</div>
		);
	}

	renderChronological( { pages, site, showPublishedStatus } ) {
		const rows = pages.map( ( page ) => {
			if ( ! ( 'site_ID' in page ) ) {
				return page;
			}

			// Render each page
			return (
				<Page
					key={ 'page-' + page.global_ID }
					shadowStatus={ this.state.shadowItems[ page.global_ID ] }
					onShadowStatusChange={ this.updateShadowStatus }
					page={ page }
					multisite={ this.props.siteId === null }
					showPublishedStatus={ showPublishedStatus }
				/>
			);
		} );

		if ( this.props.loading ) {
			this.addLoadingRows( rows, 1 );
		}

		return (
			<div id="pages" className="pages__page-list">
				{ this.renderBlogPostsPage() }
				{ this.renderVirtualHomePage() }
				{ site && this.renderSectionHeader() }
				{ rows }
				<InfiniteScroll nextPageMethod={ this.fetchPages } />
				{ this.renderListEnd() }
			</div>
		);
	}

	renderNoContent() {
		return (
			<div id="pages" className="pages__page-list">
				{ this.renderBlogPostsPage() }
				{ this.renderVirtualHomePage() }
				<div key="page-list-no-results">{ this.getNoContentMessage() }</div>
			</div>
		);
	}

	render() {
		const { hasSites, loading, areBlockEditorSettingsLoading, isFSEActiveLoading } = this.props;
		const { pages } = this.state;
		const hasPage = pages.length > 0;
		const isInitialLoad =
			( loading || areBlockEditorSettingsLoading || isFSEActiveLoading ) && ! hasPage;

		if ( ! isInitialLoad && hasSites ) {
			return pages.length > 0 ? this.renderPagesList( { pages } ) : this.renderNoContent();
		}

		return this.renderLoading();
	}
}

const mapState = ( state, { query, siteId } ) => ( {
	hasSites: hasInitializedSites( state ),
	loading: isRequestingPostsForQuery( state, siteId, query ),
	lastPage: isPostsLastPageForQuery( state, siteId, query ),
	homepageId: getSiteFrontPage( state, siteId ),
	pages: getPostsForQueryIgnoringPage( state, siteId, query ) || [],
	site: getSite( state, siteId ),
	newPageLink: getEditorUrl( state, siteId, null, 'page' ),
	homepageType: getSiteFrontPageType( state, siteId ),
} );

const ConnectedPages = flowRight(
	connect( mapState ),
	withBlockEditorSettings,
	withIsFSEActive,
	localize,
	withLocalizedMoment
)( Pages );

export default class PageList extends Component {
	static propTypes = {
		search: PropTypes.string,
		siteId: PropTypes.number,
		status: PropTypes.string,
		query: PropTypes.shape( {
			author: PropTypes.number, // User ID
			status: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
	};

	state = {
		page: 1,
	};

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
	};

	render() {
		const { search, siteId, query } = this.props;
		const { page } = this.state;

		if ( config.isEnabled( 'page/export' ) ) {
			// we need the raw content of the pages to be able to export them
			query.context = 'edit';
		}

		// Since searches are across all statuses, the status needs to be shown
		// next to each post.
		const showPublishedStatus = Boolean( search );

		return (
			<div>
				<QueryPosts siteId={ siteId } query={ { ...query, page } } />
				<ConnectedPages
					incrementPage={ this.incrementPage }
					query={ { ...query, page } }
					siteId={ siteId }
					showPublishedStatus={ showPublishedStatus }
				/>
			</div>
		);
	}
}
