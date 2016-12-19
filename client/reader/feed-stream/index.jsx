/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import FeedStore from 'lib/feed-store';
import FeedStoreActions from 'lib/feed-store/actions';
import { state as FeedStoreState } from 'lib/feed-store/constants';
import FeedError from 'reader/feed-error';
import SiteStore from 'lib/reader-site-store';
import { state as SiteState } from 'lib/reader-site-store/constants';
import RefreshFeedHeader from 'blocks/reader-feed-header';

class FeedStream extends React.Component {

	static propTypes = {
		feedId: React.PropTypes.number.isRequired,
		className: React.PropTypes.string,
		showBack: React.PropTypes.bool
	};

	static defaultProps = {
		showBack: true,
		className: 'is-site-stream',
	};

	constructor( props ) {
		super( props );
		this.state = this.getState( props );
	}

	componentDidMount() {
		FeedStore.on( 'change', this.updateState );
		SiteStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		FeedStore.off( 'change', this.updateState );
		SiteStore.off( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.feedId !== this.props.feedId ) {
			this.updateState( nextProps );
		}
	}

	getState = ( props = this.props ) => {
		const feed = this.getFeed( props ),
			site = this.getSite( props ),
			title = this.getTitle( feed, site );

		return {
			title,
			feed,
			site
		};
	}

	getTitle = ( feed, site ) => {
		let title;

		if ( ! feed && ! site ) {
			return this.props.translate( 'Loading Feed' );
		}

		if ( feed.state === FeedStoreState.ERROR ) {
			title = this.props.translate( 'Error fetching feed' );
		} else if ( feed.state === FeedStoreState.COMPLETE ) {
			title = feed.name;
		}

		if ( ! title && site ) {
			title = site.get( 'name' );
		}

		if ( ! title && feed ) {
			title = feed.URL || feed.feed_URL;
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title && site ) {
			title = site.get( 'URL' );
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title ) {
			title = this.props.translate( 'Loading Feed' );
		}

		return title;
	}

	getFeed = ( props = this.props ) => {
		const feed = FeedStore.get( props.feedId );

		if ( ! feed ) {
			FeedStoreActions.fetch( props.feedId );
		}

		return feed;
	}

	getSite = ( props = this.props ) => {
		const feed = FeedStore.get( props.feedId );
		let site;

		if ( feed && feed.blog_ID ) {
			// this comes in via a meta request, so don't bother querying it
			site = SiteStore.get( feed.blog_ID );
			if ( site && site.get( 'state' ) !== SiteState.COMPLETE ) {
				site = null; // don't accept an incomplete or error site
			}
		}

		return site;
	}

	updateState = ( props = this.props ) => {
		const feed = this.getFeed( props ),
			site = this.getSite( props ),
			title = this.getTitle( feed, site ),
			newState = {};

		if ( feed !== this.state.feed ) {
			newState.feed = feed;
		}

		if ( title !== this.state.title ) {
			newState.title = title;
		}

		if ( site && site !== this.state.site ) {
			newState.site = site;
		}

		if ( Object.keys( newState ).length > 0 ) {
			this.setState( newState );
		}
	}

	render() {
		const feed = FeedStore.get( this.props.feedId ),
			emptyContent = ( <EmptyContent /> );

		if ( feed && feed.state === FeedStoreState.ERROR ) {
			return <FeedError sidebarTitle={ this.state.title } />;
		}

		return (
			<Stream
				{ ...this.props }
				listName={ this.state.title }
				emptyContent={ emptyContent }
				showPostHeader={ false }
				showSiteNameOnCards={ false }>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: this.state.title } ) } />
				<RefreshFeedHeader feed={ feed } site={ this.state.site } showBack={ this.props.showBack } />
			</Stream>
		);
	}
}

export default localize( FeedStream );
