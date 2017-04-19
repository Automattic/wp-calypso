/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import escapeRegexp from 'escape-string-regexp';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import ReaderExportButton from 'blocks/reader-export-button';
import SitesWindowScroller from './sites-window-scroller';
import QueryReaderFollows from 'components/data/query-reader-follows';
import FollowingManageSearchFollowed from './search-followed';
import { getFeed as getReaderFeed } from 'state/reader/feeds/selectors';
import { getSite as getReaderSite } from 'state/reader/sites/selectors';
import { getReaderFollows } from 'state/selectors';
import UrlSearch from 'lib/url-search';
import { getSiteName, getSiteUrl, getSiteDescription, getSiteAuthorName } from 'reader/get-helpers';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
		doSearch: PropTypes.func.isRequired,
	};

	filterFollowsByQuery( query ) {
		const { getFeed, getSite, follows } = this.props;

		return follows.filter( follow => {
			const feed = getFeed( follow.feed_ID ); // todo grab feed and site for current sub
			const site = getSite( follow.site_ID );
			const phraseRe = new RegExp( escapeRegexp( query ), 'i' );
			const siteName = getSiteName( { feed, site } );
			const siteUrl = getSiteUrl( { feed, site } );
			const siteDescription = getSiteDescription( { feed, site } );
			const siteAuthor = getSiteAuthorName( site );

			return (
				`${ follow.URL }${ siteName }${ siteUrl }${ siteDescription }${ siteAuthor }`
			).search( phraseRe ) !== -1;
		} );
	}

	render() {
		const { follows, width, translate, query } = this.props;
		const filteredFollows = this.filterFollowsByQuery( query );

		return (
			<div className="following-manage__subscriptions">
				<QueryReaderFollows />
				<div className="following-manage__subscriptions-controls">
					{
						translate( '%(num)s Followed Sites', {
							args: { num: follows.length }
						} )
					}
					<ReaderImportButton />
					<ReaderExportButton />
					<FollowingManageSearchFollowed onSearch={ this.props.doSearch } initialValue={ query } />
				</div>
				<div className="following-manage__subscriptions-list">
					{ follows &&
						<SitesWindowScroller
							sites={ filteredFollows }
							width={ width }
						/>
					}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const follows = getReaderFollows( state );
	const getFeed = feedId => getReaderFeed( state, feedId );
	const getSite = siteId => getReaderSite( state, siteId );

	return { follows, getFeed, getSite };
};

export default connect(
	mapStateToProps,
)( localize( UrlSearch( FollowingManageSubscriptions ) ) );
