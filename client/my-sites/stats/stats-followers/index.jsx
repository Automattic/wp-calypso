/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';

/**
 * Internal dependencies
 */
import StatsListLegend from '../stats-list/legend';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsList from '../stats-list';
import ErrorPanel from '../stats-error';
import { Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class StatModuleFollowers extends Component {
	state = {
		activeFilter: 'wpcom-followers',
	};

	changeFilter = ( selection ) => {
		const filter = selection.value;
		let gaEvent;
		if ( filter !== this.state.activeFilter ) {
			switch ( filter ) {
				case 'wpcom-followers':
					gaEvent = 'Clicked By WordPress.com Followers Toggle';
					break;
				case 'email-followers':
					gaEvent = 'Clicked Email Followers Toggle';
					break;
			}
			if ( gaEvent ) {
				this.props.recordGoogleEvent( 'Stats', gaEvent );
			}

			this.setState( {
				activeFilter: filter,
			} );
		}
	};

	filterSelect() {
		const { emailData, wpcomData } = this.props;
		const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
		const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
		if ( ! hasWpcomFollowers || ! hasEmailFollowers ) {
			return null;
		}

		const options = [
			{
				value: 'wpcom-followers',
				label: this.props.translate( 'WordPress.com Followers' ),
			},
			{
				value: 'email-followers',
				label: this.props.translate( 'Email Followers' ),
			},
		];

		return <StatsModuleSelectDropdown options={ options } onSelect={ this.changeFilter } />;
	}

	render() {
		const {
			siteId,
			siteSlug,
			wpcomData,
			emailData,
			requestingWpcomFollowers,
			requestingEmailFollowers,
			hasEmailQueryFailed,
			hasWpcomQueryFailed,
			translate,
			numberFormat,
			emailQuery,
			wpcomQuery,
		} = this.props;
		const isLoading = requestingWpcomFollowers || requestingEmailFollowers;
		const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
		const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
		const noData = ! hasWpcomFollowers && ! hasEmailFollowers;
		const activeFilter = ! hasWpcomFollowers ? 'email-followers' : this.state.activeFilter;
		const activeFilterClass = 'tab-' + activeFilter;
		const hasError = hasEmailQueryFailed || hasWpcomQueryFailed;
		const classes = [
			'stats-module',
			'is-followers',
			activeFilterClass,
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData,
			},
		];

		const summaryPageSlug = siteSlug || '';
		const summaryPageLink =
			'email-followers' === activeFilter
				? '/people/email-followers/' + summaryPageSlug
				: '/people/followers/' + summaryPageSlug;

		return (
			<div>
				{ siteId && (
					<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ wpcomQuery } />
				) }
				{ siteId && (
					<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ emailQuery } />
				) }
				<SectionHeader label={ translate( 'Followers' ) } href={ summaryPageLink } />
				<Card className={ classNames( ...classes ) }>
					<div className="followers">
						<div className="module-content">
							{ noData && ! hasError && ! isLoading && (
								<ErrorPanel className="is-empty-message" message={ translate( 'No followers' ) } />
							) }

							{ this.filterSelect() }

							<div className="tab-content wpcom-followers stats-async-metabox-wrapper">
								<div className="module-content-text module-content-text-stat">
									{ wpcomData && !! wpcomData.total_wpcom && (
										<p>
											{ translate( 'Total WordPress.com Followers' ) }:{ ' ' }
											{ numberFormat( wpcomData.total_wpcom ) }
										</p>
									) }
								</div>
								<StatsListLegend value={ translate( 'Since' ) } label={ translate( 'Follower' ) } />
								{ hasWpcomFollowers && (
									<StatsList
										moduleName="wpcomFollowers"
										data={ wpcomData.subscribers }
										followList={ this.props.followList }
									/>
								) }
								{ hasWpcomQueryFailed && <ErrorPanel className="is-error" /> }
							</div>

							<div className="tab-content email-followers stats-async-metabox-wrapper">
								<div className="module-content-text module-content-text-stat">
									{ emailData && !! emailData.total_email && (
										<p>
											{ translate( 'Total Email Followers' ) }:{ ' ' }
											{ numberFormat( emailData.total_email ) }
										</p>
									) }
								</div>

								<StatsListLegend value={ translate( 'Since' ) } label={ translate( 'Follower' ) } />
								{ hasEmailFollowers && (
									<StatsList moduleName="EmailFollowers" data={ emailData.subscribers } />
								) }
								{ hasEmailQueryFailed && <ErrorPanel className={ 'network-error' } /> }
							</div>

							<StatsModulePlaceholder isLoading={ isLoading } />
						</div>
						{ ( ( wpcomData && wpcomData.subscribers.length !== wpcomData.total_wpcom ) ||
							( emailData && emailData.subscribers.length !== emailData.total_email ) ) && (
							<div key="view-all" className="module-expand">
								<a href={ summaryPageLink }>
									{ translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }
									<span className="right" />
								</a>
							</div>
						) }
					</div>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const emailQuery = { type: 'email', max: 10 };
		const wpcomQuery = { type: 'wpcom', max: 10 };

		return {
			requestingEmailFollowers: isRequestingSiteStatsForQuery(
				state,
				siteId,
				'statsFollowers',
				emailQuery
			),
			emailData: getSiteStatsNormalizedData( state, siteId, 'statsFollowers', emailQuery ),
			hasEmailQueryFailed: hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', emailQuery ),
			requestingWpcomFollowers: isRequestingSiteStatsForQuery(
				state,
				siteId,
				'statsFollowers',
				wpcomQuery
			),
			wpcomData: getSiteStatsNormalizedData( state, siteId, 'statsFollowers', wpcomQuery ),
			hasWpcomQueryFailed: hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', wpcomQuery ),
			emailQuery,
			wpcomQuery,
			siteId,
			siteSlug,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatModuleFollowers );
