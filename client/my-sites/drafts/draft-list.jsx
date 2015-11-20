/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	omit = require( 'lodash/object/omit' );

/**
 * Internal dependencies
 */
var PostListFetcher = require( 'components/post-list-fetcher' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch,
	actions = require( 'lib/posts/actions' ),
	Draft = require( 'my-sites/draft' ),
	EmptyContent = require( 'components/empty-content' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	observe = require( 'lib/mixins/data-observe' );

var DraftList = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		search: React.PropTypes.string,
		sites: React.PropTypes.object,
		siteID: React.PropTypes.any,
		trackScrollPage: React.PropTypes.func,
		onTitleClick: React.PropTypes.func,
		showAllActionsMenu: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			showAllActionsMenu: true
		}
	},

	render: function() {
		return (
			<PostListFetcher
				siteID={ this.props.siteID }
				status="draft,pending"
				withImages={ true }
				withCounts={ true }
				onTitleClick={ this.props.onTitleClick }
			>
				<Drafts
					{ ...omit( this.props, 'children' ) }
					status="draft"
				/>
			</PostListFetcher>
		);
	}
} );

var Drafts = React.createClass( {

	mixins: [ infiniteScroll( 'fetchPosts' ), observe( 'sites' ) ],

	propTypes: {
		loading: React.PropTypes.bool.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		page: React.PropTypes.number.isRequired,
		trackScrollPage: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired,
		onTitleClick: React.PropTypes.func,
		posts: React.PropTypes.array.isRequired,
		postImages: React.PropTypes.object.isRequired,
		search: React.PropTypes.string,
		siteID: React.PropTypes.any,
		showAllActionsMenu: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			loading: false,
			lastPage: false,
			page: 0,
			postImages: {},
			posts: [],
			trackScrollPage: function() {},
			showAllActionsMenu: true
		};
	},

	fetchPosts: function( options ) {
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		actions.fetchNextPage();
	},

	noDrafts: function() {
		return <EmptyContent
			title={ this.translate( 'You don\'t have any drafts.' ) }
			line={ this.translate( 'Would you like to create one?' ) }
			action={ this.translate( 'Start a Post' ) }
			actionURL={ this.props.sites.selected ? '/post/' + this.props.sites.getSelectedSite().slug : '/post' }
			illustration={ '/calypso/images/posts/illustration-posts.svg' }
			illustrationWidth={ 150 }
		/>;
	},

	render: function() {
		var posts = this.props.posts;

		// we have posts, let's render
		if ( posts.length && this.props.sites.initialized ) {
			posts = posts.map( function( post ) {
				return (
					<Draft
						key={ 'draft-' + post.ID }
						onTitleClick={ this.props.onTitleClick }
						post={ post }
						postImages={ this.props.postImages[ post.global_ID ] }
						sites={ this.props.sites }
						showAllActions={ this.props.showAllActionsMenu && hasTouch() }
					/>
				);
			}, this );

		// when posts are being fetched display a set
		// of draft placeholder elements
		} else if ( this.props.loading ) {
			posts = Array.apply( null, Array( 1 ) ).map( function( value, i ) {
				return <Draft isPlaceholder key={ 'draft-placeholder-' + i } />;
			} );

		// when no draft posts have been found
		// display an empty content message
		} else {
			return this.noDrafts();
		}

		return (
			<div>
				<div id="drafts" className="drafts__list" ref="draftList">
					{ posts }
				</div>
				{ this.props.lastPage ? <div className="infinite-scroll-end" /> : null }
			</div>
		);
	}
} );

module.exports = DraftList;
