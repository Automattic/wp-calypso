/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import StatsModulePlaceholder from '../stats-module/placeholder';
import ErrorPanel from '../stats-error';
import Pagination from '../pagination';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed
} from 'state/stats/lists/selectors';

class StatModuleFollowersPage extends Component {
	filterSelect() {
		const { changeFilter, followType, translate } = this.props;
		if ( 'comment' === followType ) {
			return null;
		}

		const options = [
			{
				value: 'wpcom',
				label: translate( 'WordPress.com Followers' )
			},
			{
				value: 'email',
				label: translate( 'Email Followers' )
			}
		];

		return <StatsModuleSelectDropdown options={ options } onSelect={ changeFilter } initialSelected={ followType } />;
	}

	render() {
		const {
			data,
			followList,
			followType,
			hasError,
			numberFormat,
			page,
			pageClick,
			query,
			perPage,
			requestingFollowers,
			siteId,
			statsType,
			translate
		} = this.props;
		const noData = followType === 'comment' ? ! get( data, 'posts' ) : ! get( data, 'subscribers' );
		const isLoading = requestingFollowers && noData;
		const classes = [
			'stats-module',
			'summary',
			'is-followers-page',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		let itemType;
		let total;
		switch ( followType ) {
			case 'comment':
				itemType = translate( 'Comments' );
				total = get( data, 'total' );
				break;

			case 'email':
				itemType = translate( 'Email' );
				total = get( data, 'total_email' );
				break;

			case 'wpcom':
				itemType = translate( 'WordPress.com' );
				total = get( data, 'total_wpcom' );
				break;
		}

		let paginationSummary;
		if ( total ) {
			const startIndex = perPage * ( page - 1 ) + 1;
			let endIndex = perPage * page;
			if ( endIndex > total ) {
				endIndex = total;
			}

			paginationSummary = translate( 'Showing %(startIndex)s - %(endIndex)s of %(total)s %(itemType)s followers', {
				context: 'pagination',
				comment: '"Showing [start index] - [end index] of [total] [item]" Example: Showing 21 - 40 of 300 WordPress.com followers',
				args: {
					startIndex: numberFormat( startIndex ),
					endIndex: numberFormat( endIndex ),
					total: numberFormat( total ),
					itemType
				}
			} );

			paginationSummary = (
				<div className="module-content-text module-content-text-stat">
					<p>{ paginationSummary }</p>
				</div>
			);
		}

		const pagination = <Pagination page={ page } perPage={ perPage } total={ total } pageClick={ pageClick } />;

		let followers;
		let labelLegend;
		let valueLegend;
		if ( data && data.posts ) {
			followers = <StatsList data={ data.posts } moduleName="Followers" />;
			labelLegend = translate( 'Post', {
				context: 'noun'
			} );
			valueLegend = translate( 'Followers' );
		} else if ( data && data.subscribers ) {
			followers = <StatsList data={ data.subscribers } followList={ followList } moduleName="Followers" />;
			labelLegend = translate( 'Follower' );
			valueLegend = translate( 'Since' );
		}

		const emailExportUrl = followType === 'email'
			? 'https://dashboard.wordpress.com/wp-admin/index.php?page=stats&blog=' + siteId + '&blog_subscribers=csv&type=email'
			: null;

		return (
			<div className="followers">
				<QuerySiteStats statType={ statsType } siteId={ siteId } query={ query } />
				<SectionHeader label={ translate( 'Followers' ) }>
					{ emailExportUrl
						? ( <Button compact href={ emailExportUrl }>{ translate( 'Download Data as CSV' ) }</Button> )
						: null }
				</SectionHeader>
				<Card className={ classNames( classes ) }>
					<div className="module-content">
						{ this.filterSelect() }

						{ noData && ! hasError && ! isLoading &&
							<ErrorPanel className="is-empty-message" message={ translate( 'No followers' ) } />
						}

						{ paginationSummary }

						{ pagination }

						<StatsListLegend value={ valueLegend } label={ labelLegend } />

						{ followers }

						{ hasError ? <ErrorPanel className="network-error" /> : null }

						<StatsModulePlaceholder isLoading={ isLoading } />

						{ pagination }
					</div>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect( ( state, { followType, page, perPage } ) => {
	let statsType;
	let query;
	if ( followType === 'comment' ) {
		statsType = 'statsCommentFollowers';
		query = {};
	} else {
		statsType = 'statsFollowers';
		query = { type: followType };
	}
	query = {
		...query,
		max: perPage,
		page
	};
	const siteId = getSelectedSiteId( state );

	return {
		requestingFollowers: isRequestingSiteStatsForQuery( state, siteId, statsType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statsType, query ),
		hasError: hasSiteStatsQueryFailed( state, siteId, statsType, query ),
		query,
		siteId,
		statsType
	};
} );

export default flowRight(
	connectComponent,
	localize
)( StatModuleFollowersPage );
