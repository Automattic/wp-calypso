/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import PostsNavigation from './posts-navigation';
import observe from 'lib/mixins/data-observe';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostList from './post-list';
import config from 'config';
import Main from 'components/main';
import QueryPosts from 'components/data/query-posts';
import QueryPostCounts from 'components/data/query-post-counts';
import PostItem from 'blocks/post-item';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import Button from 'components/button';
import Count from 'components/count';
import SectionHeader from 'components/section-header';
import { sectionify } from 'lib/route/path';
import {
	getAllPostCount,
	getMyPostCount
} from 'state/posts/counts/selectors';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import { warningNotice } from 'state/notices/actions';

const PostsMain = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		const selectedSite = this.props.sites.getSelectedSite();
		this.setWarning( selectedSite );
	},

	componentWillReceiveProps( nextProps ) {
		const selectedSite = nextProps.sites.getSelectedSite();
		this.setWarning( selectedSite );
	},

	showDrafts() {
		const site = this.props.sites.getSelectedSite();

		// Jetpack sites can have malformed counts
		if ( site.jetpack && ! this.props.loadingDrafts && this.props.drafts && this.props.drafts.length === 0 ) {
			return false;
		}

		if ( ! site.jetpack && this.props.draftCount === 0 ) {
			return false;
		}

		if ( ! site.jetpack && this.props.author && this.props.myDraftCount === 0 ) {
			return false;
		}

		return true;
	},

	mostRecentDrafts() {
		const site = this.props.sites.getSelectedSite();

		if ( ! site || ! this.showDrafts() ) {
			return null;
		}

		const { draftCount, translate } = this.props;
		const isLoading = draftCount !== 0 && this.props.loadingDrafts;

		return (
			<div className="posts__recent-drafts">
				<QueryPosts
					siteId={ site.ID }
					query={ this.props.draftsQuery } />
				<QueryPostCounts siteId={ site.ID } type="post" />
				<SectionHeader className="posts__drafts-header" label={ translate( 'Latest Drafts' ) }>
					<Button compact href={ this.props.newPostPath }>
						{ translate( 'New Post' ) }
					</Button>
				</SectionHeader>
				{ map( this.props.drafts, ( { global_ID: globalId } ) => (
					<PostItem compact key={ globalId } globalId={ globalId } />
				) ) }
				{ isLoading && <PostItem compact /> }
				{ draftCount > 6 &&
					<Button compact borderless className="posts__see-all-drafts" href={ `/posts/drafts/${ site.slug }` }>
						{ translate( 'See all drafts' ) }
						{ draftCount ? <Count count={ draftCount } /> : null }
					</Button>
				}
			</div>
		);
	},

	render() {
		const path = sectionify( this.props.context.path );
		const classes = classnames( 'posts', {
			'is-multisite': ! this.props.sites.selected,
			'is-single-site': this.props.sites.selected
		} );

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<div className="posts__primary">
					<PostsNavigation { ...this.props } />
					<PostList { ...this.props } />
				</div>
				{ path !== '/posts/drafts' && this.mostRecentDrafts() }
			</Main>
		);
	},

	setWarning( selectedSite ) {
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			this.props.warningNotice(
				this.props.translate( 'Jetpack %(version)s is required to take full advantage of all post editing features.', {
					args: { version: config( 'jetpack_min_version' ) }
				} ),
				{
					button: this.props.translate( 'Update now' ),
					href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade',
				}
			);
		}
	}

} );

export default connect(
	( state, { author } ) => {
		const siteId = getSelectedSiteId( state );
		const draftsQuery = {
			author,
			number: 6,
			order_by: 'modified',
			status: 'draft',
			type: 'post',
		};

		return {
			drafts: getSitePostsForQueryIgnoringPage( state, siteId, draftsQuery ),
			draftCount: getAllPostCount( state, siteId, 'post', 'draft' ),
			draftsQuery,
			loadingDrafts: isRequestingSitePostsForQuery( state, siteId, draftsQuery ),
			myDraftCount: getMyPostCount( state, siteId, 'post', 'draft' ),
			newPostPath: getEditorNewPostPath( state, siteId )
		};
	},
	{
		warningNotice,
	},
)( localize( PostsMain ) );
