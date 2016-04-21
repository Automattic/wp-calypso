/**
 * External dependencies
 */
var React = require( 'react' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var PostsNavigation = require( './posts-navigation' ),
	observe = require( 'lib/mixins/data-observe' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	PostList = require( './post-list' ),
	config = require( 'config' ),
	Main = require( 'components/main' ),
	notices = require( 'notices' );

import QueryPosts from 'components/data/query-posts';
import Draft from 'my-sites/draft';
import { getSelectedSite } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import SectionHeader from 'components/section-header';

const PostsMain = React.createClass( {

	displayName: 'Posts',

	mixins: [ observe( 'sites' ) ],

	componentWillMount: function() {
		var selectedSite = this.props.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	componentWillReceiveProps: function( nextProps ) {
		var selectedSite = nextProps.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	renderDraft: function( draft ) {
		if ( ! draft ) {
			return null;
		}

		return <Draft key={ draft.global_ID } post={ draft } sites={ this.props.sites } />;
	},

	render: function() {
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

	_setWarning: function( selectedSite ) {
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
