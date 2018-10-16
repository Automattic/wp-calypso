/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import { connect } from 'react-redux';

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
import getSiteBlocksCurrentPage from 'state/selectors/get-site-blocks-current-page';
import getSiteBlocksLastPage from 'state/selectors/get-site-blocks-last-page';
import SiteBlockListItem from './list-item';
import InfiniteList from 'components/infinite-list';
import { requestSiteBlocks } from 'state/reader/site-blocks/actions';

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

	renderPlaceholders() {}

	renderItem( siteId ) {
		return <SiteBlockListItem key={ 'site-block-list-item-' + siteId } siteId={ siteId } />;
	}

	getItemRef = siteId => {
		return 'site-block-' + siteId;
	};

	render() {
		const { translate, isLoading, currentPage, lastPage } = this.props;
		const containerClasses = classnames( 'site-block-list', 'main', {
			'is-loading': isLoading,
		} );

		return (
			<Main className={ containerClasses }>
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
					</p>

					<InfiniteList
						items={ this.props.blockedSites }
						className="site-blocks__list"
						fetchNextPage={ this.fetchNextPage }
						renderLoadingPlaceholders={ this.renderPlaceholders }
						renderItem={ this.renderItem }
						fetchingNextPage={ false }
						lastPage={ currentPage === lastPage }
						guessedItemHeight={ 126 }
						getItemRef={ this.getItemRef }
					/>
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
		};
	},
	{ requestSiteBlocks }
)( localize( SiteBlockList ) );
