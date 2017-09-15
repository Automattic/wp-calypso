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
import PostTypeFilter from 'my-sites/post-type-filter';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostListWrapper from './post-list-wrapper';
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
import { mapPostStatus as mapStatus, sectionify } from 'lib/route';
import {
	getAllPostCount,
	getMyPostCount
} from 'state/posts/counts/selectors';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import { warningNotice } from 'state/notices/actions';
import {
	getSiteAdminUrl,
	getSiteSlug,
	isJetpackSite,
	siteHasMinimumJetpackVersion
} from 'state/sites/selectors';

const PostsMain = React.createClass( {
	componentWillMount() {
		this.setWarning( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId || nextProps.hasMinimumJetpackVersion !== this.props.hasMinimumJetpackVersion ) {
			this.setWarning( nextProps );
		}
	},

	showDrafts() {
		const { isJetpack } = this.props;

		// Jetpack sites can have malformed counts
		if ( isJetpack && ! this.props.loadingDrafts && this.props.drafts && this.props.drafts.length === 0 ) {
			return false;
		}

		if ( ! isJetpack && this.props.draftCount === 0 ) {
			return false;
		}

		if ( ! isJetpack && this.props.author && this.props.myDraftCount === 0 ) {
			return false;
		}

		return true;
	},

	mostRecentDrafts() {
		const { siteId, siteSlug } = this.props;

		if ( ! siteId || ! this.showDrafts() ) {
			return null;
		}

		const { draftCount, translate } = this.props;
		const isLoading = draftCount !== 0 && this.props.loadingDrafts;

		return (
			<div className="posts__recent-drafts">
				<QueryPosts
					siteId={ siteId }
					query={ this.props.draftsQuery } />
				<QueryPostCounts siteId={ siteId } type="post" />
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
					<Button compact borderless className="posts__see-all-drafts" href={ `/posts/drafts/${ siteSlug }` }>
						{ translate( 'See all drafts' ) }
						{ draftCount ? <Count count={ draftCount } /> : null }
					</Button>
				}
			</div>
		);
	},

	render() {
		const { author, category, context, search, siteId, statusSlug, tag } = this.props;
		const path = sectionify( context.path );
		const classes = classnames( 'posts', {
			'is-multisite': ! this.props.siteId,
			'is-single-site': this.props.siteId
		} );
		const query = {
			author,
			category,
			search,
			status: mapStatus( statusSlug ),
			tag,
			type: 'post'
		};

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<div className="posts__primary">
					<PostTypeFilter query={ query } siteId={ siteId } />
					<PostListWrapper { ...this.props } />
				</div>
				{ path !== '/posts/drafts' && this.mostRecentDrafts() }
			</Main>
		);
	},

	setWarning( { adminUrl, hasMinimumJetpackVersion, isJetpack, siteId } ) {
		if (
			siteId &&
			isJetpack &&
			false === hasMinimumJetpackVersion
		) {
			this.props.warningNotice(
				this.props.translate( 'Jetpack %(version)s is required to take full advantage of all post editing features.', {
					args: { version: config( 'jetpack_min_version' ) }
				} ),
				{
					button: this.props.translate( 'Update now' ),
					href: adminUrl,
				}
			);
		}
	}

} );

function mapStateToProps( state, { author } ) {
	const siteId = getSelectedSiteId( state );
	const draftsQuery = {
		author,
		number: 6,
		order_by: 'modified',
		status: 'draft',
		type: 'post',
	};

	return {
		adminUrl: getSiteAdminUrl( state, siteId, 'plugins.php?plugin_status=upgrade' ),
		drafts: getSitePostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		draftCount: getAllPostCount( state, siteId, 'post', 'draft' ),
		draftsQuery,
		hasMinimumJetpackVersion: siteHasMinimumJetpackVersion( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		loadingDrafts: isRequestingSitePostsForQuery( state, siteId, draftsQuery ),
		myDraftCount: getMyPostCount( state, siteId, 'post', 'draft' ),
		newPostPath: getEditorNewPostPath( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId )
	};
}

export default connect(
	mapStateToProps,
	{
		warningNotice,
	},
)( localize( PostsMain ) );
