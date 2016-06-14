/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

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
import { getSelectedSite } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { sectionify } from 'lib/route/path';
import Count from 'components/count';
import { getAllPostCount } from 'state/posts/counts/selectors';

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

	mostRecentDrafts() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div className="posts__recent-drafts">
				<QueryPosts
					siteId={ site && site.ID }
					query={ this.props.draftsQuery } />
				<QueryPostCounts siteId={ site && site.ID } type="post" />
				<Card compact className="posts__drafts-header">
					<span>
						{ this.translate( 'Drafts' ) }
						{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
					</span>
					<Button disabled={ ! site } borderless href={ `/post/${ site.slug }` }>
						<Gridicon icon="plus" />
					</Button>
				</Card>
				{ this.props.drafts && this.props.drafts.map( this.renderDraft, this ) }
				{ ! this.props.drafts && this.props.loadingDrafts && <Draft isPlaceholder /> }
			</div>
		);
	},

	renderDraft( draft ) {
		if ( ! draft ) {
			return null;
		}

		return <Draft key={ draft.global_ID } post={ draft } sites={ this.props.sites } />;
	},

	render() {
		const path = sectionify( this.props.context.path );
		return (
			<Main className="posts">
				<SidebarNavigation />
				<div className="posts__primary">
					<PostsNavigation { ...this.props } />
					<PostList { ...this.props } />
				</div>
				{ this.mostRecentDrafts() }
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

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const siteId = selectedSite && selectedSite.ID;
	const draftsQuery = {
		type: 'post',
		lastPage: true,
		status: 'draft',
		order_by: 'modified'
	};

	return {
		drafts: getSitePostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		loadingDrafts: isRequestingSitePostsForQuery( state, siteId, draftsQuery ),
		draftsQuery: draftsQuery,
		draftCount: getAllPostCount( state, siteId, 'post', 'draft' )
	};
} )( PostsMain );
