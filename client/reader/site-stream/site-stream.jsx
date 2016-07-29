/**
 * External dependencies
 */

 import React from 'react';
 import { connect } from 'react-redux';
 import { get } from 'lodash';
 import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';

import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import FeedHeader from 'reader/feed-header';
import HeaderBack from 'reader/header-back';
import Stream from 'reader/stream';
import EmptyContent from './empty';

class SiteStream extends React.Component {
	static defaultProps = {
		showBack: true
	}

	static propTypes = {
		siteId: React.PropTypes.number.isRequired,
		onUpdatesShown: React.PropTypes.func,
		showBack: React.PropTypes.bool,
		suppressSiteNameLink: React.PropTypes.bool,
		trackScrollPage: React.PropTypes.func
	}
	constructor( props ) {
		super( props );
	}
	render() {
		const { site, siteId, title, feed } = this.props,
			//emptyContent = ( <EmptyContent /> ),
			feedId = site ? get( site, 'feed_ID' ) : null;

		this.props.setPageTitle( title );

		// get featured content ...
		return (
			<div>
			<QueryReaderSite siteId={ siteId }/>
			{ feedId && <QueryReaderFeed feedId={ feedId } /> }
			<FeedHeader site={ site } feed={ feed }/>
			</div>
			// <Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showPostHeader={ false }>
			// 	{ this.props.showBack && <HeaderBack /> }
			//
			// </Stream>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const site = getSite( state, ownProps.siteId ),
			setPageTitle = get( ownProps, 'setPageTitle' ) || noop;

		let feed = null,
			title = translate( 'Loading Site' );

		if ( site ) {
			feed = getFeed( state, get( site, 'feed_ID' ) );
			title = get( site, 'title' ) || get( site, 'domain' );
		}

		return {
			site,
			feed,
			title,
			setPageTitle
		};
	}
)( SiteStream );
