/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { defer } from 'lodash';
import Perf from 'react-addons-perf'; // ES6
Perf.start();
window.Perf = Perf;

/**
 * Internal Dependencies
 */
import PostStore from 'lib/feed-post-store';
import PostStoreActions from 'lib/feed-post-store/actions';
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import CrossPost from './x-post';
import XPostHelper from 'reader/xpost-helper';

export default class PostLifecycle extends React.PureComponent {
	static propTypes = {
		postKey: PropTypes.object,
		isDiscoverStream: PropTypes.bool
	}

	state = {
		post: this.getPostFromStore()
	}

	getPostFromStore( props = this.props ) {
		const post = PostStore.get( props.postKey );
		if ( ! post || post._state === 'minimal' ) {
			defer( () => PostStoreActions.fetchPost( props.postKey ) );
		}
		return post;
	}

	updatePost = ( props = this.props ) => {
		const post = this.getPostFromStore( props );
		if ( post !== this.state.post ) {
			this.setState( { post } );
		}
	}

	componentWillMount() {
		PostStore.on( 'change', this.updatePost );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updatePost );
	}

	componentWillReceiveProps( nextProps ) {
		this.updatePost( nextProps );
	}

	shouldComponentUpdate( nextProps, nextState ) {
		const {
			isSelected, suppressSiteNameLink, showPostHeader, showFollowInHeader,
			showPrimaryFollowButtonOnCards, showSiteName, isDiscoverStream,
		} = this.props;

		const shouldUpdate = this.state.post !== nextState.post ||
			isSelected !== nextProps.isSelected ||
			suppressSiteNameLink !== nextProps.suppressSiteNameLink ||
			showPostHeader !== nextProps.showPostHeader ||
			showFollowInHeader !== nextProps.showFollowInHeader ||
			showPrimaryFollowButtonOnCards !== showPrimaryFollowButtonOnCards ||
			showSiteName !== nextProps.showSiteName ||
			isDiscoverStream !== nextProps.isDiscoverStream;

		return shouldUpdate;
	}

	render() {
		const post = this.state.post;
		let postState = post._state;

		if ( ! post || postState === 'minimal' ) {
			postState = 'pending';
		}

		switch ( postState ) {
			case 'pending':
				return <PostPlaceholder />;
			case 'error':
				return <PostUnavailable post={ post } />;
			default:
				const PostClass = this.props.cardClassForPost( post );
				if ( PostClass === CrossPost ) {
					const xMetadata = XPostHelper.getXPostMetadata( post );
					return <CrossPost
						post={ post }
						isSelected={ this.props.isSelected }
						xMetadata={ xMetadata }
						xPostedTo={ this.props.store.getSitesCrossPostedTo( xMetadata.commentURL || xMetadata.postURL ) }
						handleClick={ this.props.handleClick } />;
				}

				return <PostClass
					post={ post }
					isSelected={ this.props.isSelected }
					followSource={ this.props.followSource }
					xPostedTo={ this.props.store.getSitesCrossPostedTo( post.URL ) }
					suppressSiteNameLink={ this.props.suppressSiteNameLink }
					showPostHeader={ this.props.showPostHeader }
					showFollowInHeader={ this.props.showFollowInHeader }
					handleClick={ this.props.handleClick }
					showPrimaryFollowButtonOnCards={ this.props.showPrimaryFollowButtonOnCards }
					showSiteName={ this.props.showSiteName }
					isDiscoverStream={ this.props.isDiscoverStream }
				/>;
		}
	}
}
