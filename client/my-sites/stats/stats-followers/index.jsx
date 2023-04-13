import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SectionHeader from 'calypso/components/section-header';
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
		const { emailData, wpcomData } = this.props;
		const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
		const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
		if ( ! hasWpcomFollowers || ! hasEmailFollowers ) {
			return null;
		}

		const options = this.filterOptions();

		return <StatsModuleSelectDropdown options={ options } onSelect={ this.changeFilter } />;
	}

	filterOptions() {
		const { translate, isInsightsPageGridEnabled } = this.props;
		return [
			{
				value: 'wpcom-followers',
				label: ! isInsightsPageGridEnabled
					? translate( 'WordPress.com subscribers' )
					: translate( 'WordPress.com' ),
			},
			{
				value: 'email-followers',
				label: ! isInsightsPageGridEnabled
					? translate( 'Email subscribers' )
					: translate( 'Email' ),
			},
		];
	}

	calculateOffset( pastValue ) {
		const { translate } = this.props;

		const now = new Date();
		const value = new Date( pastValue );
		const difference = now.getTime() - value.getTime();

		const seconds = Math.floor( difference / 1000 );
		const minutes = Math.floor( seconds / 60 );
		const hours = Math.floor( minutes / 60 );
		const days = Math.floor( hours / 24 );

		let result = '';

		if ( days > 0 ) {
			result = translate( '%d days', { args: days } );
		} else if ( hours > 0 ) {
			result = translate( '%d hours', { args: hours } );
		} else if ( minutes > 0 ) {
			result = translate( '%d minutes', { args: minutes } );
		}

		return result;
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
		// email-followers is no longer available, so fallback to the new subscribers URL.
		// Old, non-functional path: '/people/email-followers/' + summaryPageSlug.
		let summaryPageLink = '/people/subscribers/' + summaryPageSlug;

		// Limit scope for Odyssey stats, as the Followers page is not yet available.
		summaryPageLink = ! isOdysseyStats ? summaryPageLink : null;

		const data =
			( activeFilter === 'wpcom-followers' ? wpcomData?.subscribers : emailData?.subscribers ) ||
			[];

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
						data={ data.map( ( dataPoint ) => ( {
							...dataPoint,
							value: this.calculateOffset( dataPoint.value?.value ), // case 'relative-date': value = this.props.moment( valueData.value ).fromNow( true );
						} ) ) }
						usePlainCard
						title={ translate( 'Subscribers' ) }
						emptyMessage={ translate( 'No subscribers' ) }
						mainItemLabel={ translate( 'Subscriber' ) }
						metricLabel={ translate( 'Since' ) }
						splitHeader
						useShortNumber
						showMore={
							summaryPageLink
								? {
										url: summaryPageLink,
										label:
											data.length >= 10 // TODO: reduce to 5 items when surrounding cards get a summary page
												? this.props.translate( 'View all', {
														context: 'Stats: Button link to show more detailed stats information',
												  } )
												: this.props.translate( 'View details', {
														context: 'Stats: Button label to see the detailed content of a panel',
												  } ),
								  }
								: undefined
						}
						error={
							noData &&
							! hasError &&
							! isLoading && (
								<ErrorPanel
									className="is-empty-message"
									message={ translate( 'No subscribers' ) }
								/>
							)
						}
						loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
						toggleControl={
							<SimplifiedSegmentedControl
								options={ this.filterOptions() }
								onSelect={ this.changeFilter }
							/>
						}
						className="stats__modernised-comments"
						isLinkUnderlined={ activeFilter === 'wpcom-followers' }
						showLeftIcon
					/>
				) }
				{ ! isInsightsPageGridEnabled && (
					<div className="list-followers">
						<SectionHeader label={ translate( 'Subscribers' ) } href={ summaryPageLink } />
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
