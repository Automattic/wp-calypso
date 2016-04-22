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
import Draft from 'my-sites/draft';
import { getSelectedSite } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import SectionHeader from 'components/section-header';

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

	renderDraft( draft ) {
		if ( ! draft ) {
			return null;
		}

		return <Draft key={ draft.global_ID } post={ draft } sites={ this.props.sites } />;
	},

	render() {
		const site = this.props.sites.getSelectedSite();
		return (
			<Main className="posts">
				<SidebarNavigation />
				<PostsNavigation { ...this.props } />
				<div className="posts__recent-drafts">
					<QueryPosts
						siteId={ site && site.ID }
						query={ this.props.query } />
					{ this.props.drafts &&
						<SectionHeader label={ this.translate( 'Most Recent Drafts' ) } />
					}
					{ this.props.drafts && this.props.drafts.map( this.renderDraft, this ) }
				</div>
				<PostList { ...this.props } />
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
	const siteId = selectedSite.ID;
	const query = {
		type: 'post',
		lastPage: true,
		status: 'draft',
		number: 3,
		order_by: 'modified'
	};

	return {
		drafts: getSitePostsForQueryIgnoringPage( state, siteId, query ),
		loading: isRequestingSitePostsForQuery( state, siteId, query ),
		query: query
	};
} )( PostsMain );
