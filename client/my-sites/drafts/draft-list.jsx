/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import AuthorSelector from './author-selector';
import Count from 'components/count';
import Draft from 'my-sites/draft';
import EmptyContent from 'components/empty-content';
import PostListFetcher from 'components/post-list-fetcher';
import QueryPostCounts from 'components/data/query-post-counts';
import {
	getNormalizedPostCounts,
	getNormalizedMyPostCounts,
	isRequestingPostCounts
} from 'state/posts/counts/selectors';
import actions from 'lib/posts/actions';
import { hasTouch } from 'lib/touch-detect';
import infiniteScroll from 'lib/mixins/infinite-scroll';
import observe from 'lib/mixins/data-observe';
import userLib from 'lib/user';
const user = userLib();

class DraftList extends Component {

	static propTypes = {
		search: PropTypes.string,
		sites: PropTypes.object,
		siteID: PropTypes.any,
		trackScrollPage: PropTypes.func,
		onTitleClick: PropTypes.func,
		showAllActionsMenu: PropTypes.bool,
		selectedId: PropTypes.number
	};

	static defaultProps = {
		showAllActionsMenu: true,
		selectedId: false
	};

	constructor( props ) {
		super( props );
		this.state = {
			authorFilter: 'me'
		};
	}

	setAuthorFilter = authorFilter => {
		this.setState( { authorFilter } );
	}

	render() {
		const { siteID, counts, isRequestingCounts, selectedId } = this.props;
		const { authorFilter } = this.state;
		const author = authorFilter === 'me' ? user.get().ID : null;
		const showCount = siteID && ( ! isRequestingCounts || counts[ authorFilter ] );

		return (
			<div>
				{ siteID && <QueryPostCounts siteId={ siteID } type="post" /> }
				<div className="drafts__header">
					<AuthorSelector selectedScope={ authorFilter }
						onChange={ this.setAuthorFilter } />
					{ showCount && <Count count={ counts[ authorFilter ] } /> }
				</div>
				<PostListFetcher
					siteID={ this.props.siteID }
					status="draft,pending"
					author={ author }
					withImages={ true }
					withCounts={ true }
					onTitleClick={ this.props.onTitleClick }
				>
					<Drafts
						{ ...omit( this.props, 'children' ) }
						status="draft"
						selectedId={ selectedId }
					/>
				</PostListFetcher>
			</div>
		);
	}
}

const Drafts = React.createClass( {

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
		showAllActionsMenu: React.PropTypes.bool,
		selectedId: React.PropTypes.number
	},

	getDefaultProps: function() {
		return {
			loading: false,
			lastPage: false,
			page: 0,
			postImages: {},
			posts: [],
			trackScrollPage: function() {},
			showAllActionsMenu: true,
			selectedId: false
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
		let posts = this.props.posts;

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
						selected={ this.props.selectedId === post.ID }
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

module.exports = connect( ( state, { siteID } ) => {
	const counts = {
		me: getNormalizedMyPostCounts( state, siteID, 'post' ).draft,
		everyone: getNormalizedPostCounts( state, siteID, 'post' ).draft
	};

	return {
		isRequestingCounts: isRequestingPostCounts( state, siteID, 'post' ),
		counts
	};
} )( DraftList );
