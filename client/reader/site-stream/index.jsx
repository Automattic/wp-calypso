/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FeedHeader from 'reader/feed-header';
import FeedFeatured from './featured';
import EmptyContent from './empty';
import Stream from 'reader/stream';
import HeaderBack from 'reader/header-back';
import SiteStore from 'lib/reader-site-store';
import SiteStoreActions from 'lib/reader-site-store/actions';
import { state as SiteState } from 'lib/reader-site-store/constants';
import FeedError from 'reader/feed-error';
import FeedStore from 'lib/feed-store';
import FeedStoreActions from 'lib/feed-store/actions';
import { state as FeedState } from 'lib/feed-store/constants';
import FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import feedStreamFactory from 'lib/feed-stream-store';
import smartSetState from 'lib/react-smart-set-state';

function checkForRedirect( site ) {
	if ( site && site.get( 'prefer_feed' ) && site.get( 'feed_ID' ) ) {
		setTimeout( function() {
			page.replace( '/read/feeds/' + site.get( 'feed_ID' ) );
		}, 0 );
	}
}

class SiteStream extends React.Component {

	static propTypes = {
		siteId: React.PropTypes.number.isRequired
	};

	static defaultProps = {
		showBack: true
	};

	constructor( props ) {
		super( props );
		this.state = this.getState( props );
		this.smartSetState = smartSetState;
	}

	componentDidMount() {
		SiteStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		SiteStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps );
		}
	}

	getState = ( props = this.props ) => {
		const { site, feed } = this.getSiteAndFeed( props.siteId );
		checkForRedirect( site );

		const state = {
			feed,
			site,
			title: props.title || this.getTitle( site )
		};

		return state;
	}

	updateState = ( props = this.props ) => {
		const state = this.getState( props );
		checkForRedirect( state.site );
		this.smartSetState( state );
	}

	getSiteAndFeed = ( siteId ) => {
		let site = SiteStore.get( siteId ),
			feed;

		if ( ! site ) {
			SiteStoreActions.fetch( siteId );
		}

		if ( site && ! includes( [ SiteState.COMPLETE, SiteState.ERROR ], site.get( 'state' ) ) ) {
			site = null; // don't accept an incomplete site
		}

		if ( site && site.get( 'state' ) === SiteState.COMPLETE && site.get( 'feed_ID' ) ) {
			feed = FeedStore.get( site.get( 'feed_ID' ) );
			if ( ! feed ) {
				setTimeout( () => {
					FeedStoreActions.fetch( site.get( 'feed_ID' ) );
				}, 0 );
			} else if ( feed.state !== FeedState.COMPLETE ) {
				feed = null;
			}
		}

		return { site, feed };
	}

	getTitle = ( site ) => {
		if ( ! site ) {
			return;
		}

		if ( site.get( 'state' ) === SiteState.COMPLETE ) {
			return site.get( 'title' ) || site.get( 'domain' );
		} else if ( site.get( 'state' ) === SiteState.ERROR ) {
			return this.props.translate( 'Error fetching site' );
		}
	}

	goBack = () => {
		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	}

	render() {
		const site = this.state.site,
			emptyContent = ( <EmptyContent /> );
		let title = this.state.title,
			featuredStore = null,
			featuredContent = null;

		if ( ! title ) {
			title = this.props.translate( 'Loading Site' );
		}

		if ( site && site.get( 'state' ) === SiteState.ERROR ) {
			return <FeedError sidebarTitle={ title } />;
		}

		if ( site && site.get( 'has_featured' ) ) {
			featuredStore = feedStreamFactory( 'featured:' + site.get( 'ID' ) );
			setTimeout( () => FeedStreamStoreActions.fetchNextPage( featuredStore.id ), 0 ); // timeout to prevent invariant violations
			featuredContent = ( <FeedFeatured store={ featuredStore } /> );
		}

		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showPostHeader={ false }>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
				{ this.props.showBack && <HeaderBack /> }
				<FeedHeader site={ site } feed={ this.state.feed } />
				{ featuredContent }
			</Stream>

		);
	}
}

export default localize( SiteStream );
