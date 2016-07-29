/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import StickyPanel from 'components/sticky-panel';
import Gridicon from 'components/gridicon';
import { setSection } from 'state/ui/actions';
import smartSetState from 'lib/react-smart-set-state';
import PostStore from 'lib/feed-post-store';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import { fetchPost } from 'lib/feed-post-store/actions';
import ReaderFullPostHeader from './header';

export class FullPostView extends React.Component {
	render() {
		/*eslint-disable react/no-danger*/
		return (
			<Main className="reader-full-post">
				<StickyPanel>
					<div className="reader-full-post__back">
						<Gridicon icon="arrow-left" />
					{ translate( 'Back' ) }
					</div>
				</StickyPanel>
				<ReaderFullPostHeader post={ this.props.post } />
				<div dangerouslySetInnerHTML={ { __html: this.props.post.content } } />
			</Main>
		);
	}
}

/**
 * A container for the FullPostView responsible for binding to Flux stores
 */
export class FullPostFluxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
		this.updateState = this.updateState.bind( this );
		this.smartSetState = smartSetState;
	}

	getStateFromStores( props = this.props ) {
		const postKey = {
			blogId: props.blogId,
			feedId: props.feedId,
			postId: props.postId
		};

		const post = PostStore.get( postKey );

		if ( ! post ) {
			fetchPost( postKey );
		}

		let feed, site;

		if ( post && post.feed_ID ) {
			feed = FeedStore.get( post.feed_ID );
		}
		if ( post && post.site_ID ) {
			site = SiteStore.get( post.site_ID );
		}

		return {
			post,
			site,
			feed
		};
	}

	updateState() {
		this.smartSetState( this.getStateFromStores() );
	}

	componentWillMount() {
		PostStore.on( 'change', this.updateState );
		SiteStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		this.updateState( this.getStateFromStores( nextProps ) );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updateState );
		SiteStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	}

	render() {
		return this.state.post
			? <FullPostView post={ this.state.post } site={ this.state.site } feed={ this.state.feed } />
			: null;
	}
}

export default connect(
	state => {
		return { };
	},
	dispatch => {
		return bindActionCreators( {
			setSection
		}, dispatch );
	}
)( FullPostFluxContainer );
