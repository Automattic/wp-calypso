import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';

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
		const { emailData, wpcomData, isInsightsPageGridEnabled } = this.props;
		const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
		const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
		if ( ! hasWpcomFollowers || ! hasEmailFollowers ) {
			return null;
		}

		const options = [
			{
				value: 'wpcom-followers',
				label: this.props.translate( 'WordPress.com subscribers' ),
			},
			{
				value: 'email-followers',
				label: this.props.translate( 'Email subscribers' ),
			},
		];

		return isInsightsPageGridEnabled ? (
			<SimplifiedSegmentedControl options={ options } onSelect={ this.changeFilter } />
		) : (
			<StatsModuleSelectDropdown options={ options } onSelect={ this.changeFilter } />
		);
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
			isOdysseyStats,
			isInsightsPageGridEnabled,
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
		let summaryPageLink =
			'email-followers' === activeFilter
				? '/people/email-followers/' + summaryPageSlug
				: '/people/followers/' + summaryPageSlug;

		// Limit scope for Odyssey stats, as the Followers page is not yet available.
		summaryPageLink = ! isOdysseyStats ? summaryPageLink : null;

		const data =
			this.state.activeFilter === 'email'
				? emailData?.subscribers ?? []
				: wpcomData?.subscribers ?? [];

		return (
			<>
				{ siteId && (
					<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ wpcomQuery } />
				) }
				{ siteId && (
					<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ emailQuery } />
				) }
				{ isInsightsPageGridEnabled && (
					<StatsListCard
						moduleType="followers"
						data={ data }
						title={ translate( 'Subscriber' ) }
						emptyMessage={ translate( 'No subscribers' ) }
						mainItemLabel={ translate( 'Subscriber' ) }
						metricLabel={ translate( 'Since' ) }
						splitHeader
						useShortNumber
						showMore={ summaryPageLink }
						error={
							noData &&
							! hasError &&
							! requestingWpcomFollowers && (
								<ErrorPanel
									className="is-empty-message"
									message={ translate( 'No subscribers' ) }
								/>
							)
						}
						loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
						toggleControl={ this.filterSelect() }
						className="stats__modernised-followers"
					/>
				) }
				{ ! isInsightsPageGridEnabled && (
					<div className="list-followers">
						<Card className={ classNames( ...classes ) }>
							<div className="followers">
								<div className="module-content">
									{ noData && ! hasError && ! isLoading && (
										<ErrorPanel
											className="is-empty-message"
											message={ translate( 'No subscribers' ) }
										/>
									) }

									{ this.filterSelect() }

									<div className="tab-content wpcom-followers stats-async-metabox-wrapper">
										<div className="module-content-text module-content-text-stat">
											{ wpcomData && !! wpcomData.total_wpcom && (
												<p>
													{ translate( 'Total WordPress.com subscribers' ) }:{ ' ' }
													{ numberFormat( wpcomData.total_wpcom ) }
												</p>
											) }
										</div>
										<StatsListLegend
											value={ translate( 'Since' ) }
											label={ translate( 'Subscriber' ) }
										/>
										{ hasWpcomFollowers && (
											<StatsList moduleName="wpcomFollowers" data={ wpcomData.subscribers } />
										) }
										{ hasWpcomQueryFailed && <ErrorPanel className="is-error" /> }
									</div>

									<div className="tab-content email-followers stats-async-metabox-wrapper">
										<div className="module-content-text module-content-text-stat">
											{ emailData && !! emailData.total_email && (
												<p>
													{ translate( 'Total Email Subscribers' ) }:{ ' ' }
													{ numberFormat( emailData.total_email ) }
												</p>
											) }
										</div>

										<StatsListLegend
											value={ translate( 'Since' ) }
											label={ translate( 'Subscriber' ) }
										/>
										{ hasEmailFollowers && (
											<StatsList moduleName="EmailFollowers" data={ emailData.subscribers } />
										) }
										{ hasEmailQueryFailed && <ErrorPanel className="network-error" /> }
									</div>

									<StatsModulePlaceholder isLoading={ isLoading } />
								</div>
								{ ( ( wpcomData && wpcomData.subscribers.length !== wpcomData.total_wpcom ) ||
									( emailData && emailData.subscribers.length !== emailData.total_email ) ) && (
									<div key="view-all" className="module-expand">
										<a href={ summaryPageLink }>
											{ translate( 'View all', {
												context: 'Stats: Button label to expand a panel',
											} ) }
											<span className="right" />
										</a>
									</div>
								) }
							</div>
						</Card>
					</div>
				) }
			</>
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
			isOdysseyStats: config.isEnabled( 'is_running_in_jetpack_site' ),
			isInsightsPageGridEnabled: config.isEnabled( 'stats/insights-page-grid' ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatModuleFollowers );
