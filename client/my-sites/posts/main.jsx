/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PostsNavigation from './posts-navigation';
import observe from 'lib/mixins/data-observe';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostList from './post-list';
import config from 'config';
import Main from 'components/main';
import notices from 'notices';
import QueryPosts from 'components/data/query-posts';
import QueryPostCounts from 'components/data/query-post-counts';
import Draft from 'my-sites/draft';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import Button from 'components/button';
import Card from 'components/card';
import Count from 'components/count';
import Gridicon from 'components/gridicon';
import { sectionify } from 'lib/route/path';
import { getAllPostCount } from 'state/posts/counts/selectors';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';

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

		return true;
	},

	mostRecentDrafts() {
		const site = this.props.sites.getSelectedSite();
		const isLoading = this.props.draftCount !== 0 && this.props.loadingDrafts;

		if ( ! site || ! this.showDrafts() ) {
			return null;
		}

		return (
			<div className="posts__recent-drafts">
				<QueryPosts
					siteId={ site.ID }
					query={ this.props.draftsQuery } />
				<QueryPostCounts siteId={ site.ID } type="post" />
				<Card compact className="posts__drafts-header">
					{ this.translate( 'Latest Drafts' ) }
					<Button borderless href={ this.props.newPostPath }>
						<Gridicon icon="plus" />
					</Button>
				</Card>
				{ this.props.drafts && this.props.drafts.map( this.renderDraft, this ) }
				{ isLoading && <Draft isPlaceholder /> }
				{ this.props.draftCount > 6 &&
					<Button compact borderless className="posts__see-all-drafts" href={ `/posts/drafts/${ site.slug }` }>
						{ this.translate( 'See all drafts' ) }
						{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
					</Button>
				}
			</div>
		);
	},

	renderDraft( draft ) {
		if ( ! draft ) {
			return null;
		}

		const site = this.props.sites.getSelectedSite();

		return <Draft
			key={ draft.global_ID }
			post={ draft }
			sites={ this.props.sites }
			showAuthor={ site && ! site.single_user_site && ! this.props.author }
		/>;
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
			notices.warning(
				this.translate( 'Jetpack %(version)s is required to take full advantage of all post editing features.', { args: { version: config( 'jetpack_min_version' ) } } ),
				{ button: this.translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}

} );

export default connect( ( state, props ) => {
	const siteId = getSelectedSiteId( state );
	const draftsQuery = {
		type: 'post',
		status: 'draft',
		number: 6,
		order_by: 'modified',
		author: props.author
	};

	return {
		drafts: getSitePostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		loadingDrafts: isRequestingSitePostsForQuery( state, siteId, draftsQuery ),
		draftsQuery: draftsQuery,
		draftCount: getAllPostCount( state, siteId, 'post', 'draft' ),
		newPostPath: getEditorNewPostPath( state, siteId )
	};
} )( PostsMain );
