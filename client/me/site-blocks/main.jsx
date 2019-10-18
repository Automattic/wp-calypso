/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteBlocks from 'components/data/query-site-blocks';
import getBlockedSites from 'state/selectors/get-blocked-sites';
import isFetchingSiteBlocks from 'state/selectors/is-fetching-site-blocks';
import getSiteBlocksCurrentPage from 'state/selectors/get-site-blocks-current-page';
import getSiteBlocksLastPage from 'state/selectors/get-site-blocks-last-page';
import SiteBlockListItem from './list-item';
import InfiniteList from 'components/infinite-list';
import { requestSiteBlocks } from 'state/reader/site-blocks/actions';
import SiteBlockListItemPlaceholder from './list-item-placeholder';

/**
 * Style dependencies
 */
import './style.scss';

class SiteBlockList extends Component {
	fetchNextPage = () => {
		const { currentPage, lastPage } = this.props;

		if ( currentPage === lastPage ) {
			return;
		}

		this.props.requestSiteBlocks( { page: currentPage + 1 } );
	};

	renderPlaceholders() {
		return times( 2, i => (
			<SiteBlockListItemPlaceholder key={ 'site-block-list-item-placeholder-' + i } />
		) );
	}

	renderItem( siteId ) {
		return <SiteBlockListItem key={ 'site-block-list-item-' + siteId } siteId={ siteId } />;
	}

	getItemRef = siteId => {
		return 'site-block-' + siteId;
	};

	render() {
		const { translate, blockedSites, currentPage, lastPage } = this.props;
		const hasNoBlocks = blockedSites.length === 0 && currentPage === lastPage;

		return (
			<Main className="site-blocks">
				<QuerySiteBlocks />
				<PageViewTracker path="/me/site-blocks" title="Me > Blocked Sites" />
				<DocumentHead title={ translate( 'Blocked Sites' ) } />
				<MeSidebarNavigation />
				<SectionHeader label={ translate( 'Blocked Sites' ) } />
				<Card className="site-blocks__intro">
					<p>
						{ translate(
							'Blocked sites will not appear in your Reader and will not be recommended to you.'
						) }
						<a href="https://en.support.wordpress.com/reader/#blocking-sites">
							{ translate( ' Learn more.' ) }
						</a>
					</p>

					{ hasNoBlocks && <p>{ translate( "You haven't blocked any sites yet." ) }</p> }

					{ ! hasNoBlocks && (
						<InfiniteList
							items={ this.props.blockedSites }
							className="site-blocks__list"
							fetchNextPage={ this.fetchNextPage }
							renderLoadingPlaceholders={ this.renderPlaceholders }
							renderItem={ this.renderItem }
							fetchingNextPage={ this.props.isFetching }
							lastPage={ currentPage === lastPage }
							guessedItemHeight={ 100 }
							getItemRef={ this.getItemRef }
						/>
					) }
				</Card>
			</Main>
		);
	}
}

export default connect(
	state => {
		return {
			blockedSites: getBlockedSites( state ),
			currentPage: getSiteBlocksCurrentPage( state ),
			lastPage: getSiteBlocksLastPage( state ),
			isFetching: isFetchingSiteBlocks( state ),
		};
	},
	{ requestSiteBlocks }
)( localize( SiteBlockList ) );
