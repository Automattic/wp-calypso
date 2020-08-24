/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import ErrorPanel from '../stats-error';
import StatsModuleExpand from './expand';
import StatsModuleAvailabilityWarning from './availability-warning';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import { Card } from '@automattic/components';
import StatsModulePlaceholder from './placeholder';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import UpsellNudge from 'blocks/upsell-nudge';
import AllTimeNav from './all-time-nav';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';
import { FEATURE_GOOGLE_ANALYTICS, PLAN_PREMIUM } from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

class StatsModule extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		moduleStrings: PropTypes.object,
		period: PropTypes.object,
		path: PropTypes.string,
		siteSlug: PropTypes.string,
		siteId: PropTypes.number,
		data: PropTypes.array,
		query: PropTypes.object,
		statType: PropTypes.string,
		showSummaryLink: PropTypes.bool,
		translate: PropTypes.func,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {},
	};

	state = {
		loaded: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.requesting && this.props.requesting ) {
			this.setState( { loaded: true } );
		}

		if ( nextProps.query !== this.props.query && this.state.loaded ) {
			this.setState( { loaded: false } );
		}
	}

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.props.moduleStrings.title;
		}
		const { period, startOf } = this.props.period;
		const { path, query } = this.props;

		return (
			<DatePicker
				period={ period }
				date={ startOf }
				path={ path }
				query={ query }
				summary={ true }
			/>
		);
	}

	getHref() {
		const { summary, period, path, siteSlug } = this.props;

		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return (
				'/stats/' +
				period.period +
				'/' +
				path +
				'/' +
				siteSlug +
				'?startDate=' +
				period.startOf.format( 'YYYY-MM-DD' )
			);
		}
	}

	isAllTimeList() {
		const { summary, statType } = this.props;
		const summarizedTypes = [
			'statsCountryViews',
			'statsTopPosts',
			'statsSearchTerms',
			'statsClicks',
			'statsReferrers',
		];
		return summary && includes( summarizedTypes, statType );
	}

	render() {
		const {
			className,
			summary,
			siteId,
			path,
			data,
			moduleStrings,
			requesting,
			statType,
			query,
			period,
			translate,
			useShortLabel,
		} = this.props;

		const noData = data && this.state.loaded && ! data.length;

		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );

		// TODO: Support error state in redux store
		const hasError = false;

		const cardClasses = classNames(
			'stats-module',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': noData,
			},
			className
		);

		const summaryLink = this.getHref();
		const displaySummaryLink = data && data.length >= 10;
		const isAllTime = this.isAllTimeList();
		const headerClass = classNames( 'stats-module__header', {
			'is-refreshing': requesting && ! isLoading,
		} );

		return (
			<div>
				{ siteId && statType && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				{ ! isAllTime && (
					<SectionHeader
						className={ headerClass }
						label={ this.getModuleLabel() }
						href={ ! summary ? summaryLink : null }
					>
						{ summary && (
							<DownloadCsv statType={ statType } query={ query } path={ path } period={ period } />
						) }
					</SectionHeader>
				) }
				<Card compact className={ cardClasses }>
					{ statType === 'statsFileDownloads' && (
						<StatsModuleAvailabilityWarning
							statType={ statType }
							startOfPeriod={ period && period.startOf }
						/>
					) }
					{ isAllTime && <AllTimeNav path={ path } query={ query } period={ period } /> }
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }
					{ this.props.children }
					<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
					<StatsModulePlaceholder isLoading={ isLoading } />
					<StatsList moduleName={ path } data={ data } useShortLabel={ useShortLabel } />
					{ this.props.showSummaryLink && displaySummaryLink && (
						<StatsModuleExpand href={ summaryLink } />
					) }
					{ summary && 'countryviews' === path && (
						<UpsellNudge
							title={ translate( 'Add Google Analytics' ) }
							description={ translate(
								'Upgrade to a Premium Plan for Google Analytics integration.'
							) }
							event="googleAnalytics-stats-countries"
							feature={ FEATURE_GOOGLE_ANALYTICS }
							plan={ PLAN_PREMIUM }
							tracksImpressionName="calypso_upgrade_nudge_impression"
							tracksClickName="calypso_upgrade_nudge_cta_click"
							showIcon={ true }
						/>
					) }
				</Card>
				{ isAllTime && (
					<div className="stats-module__footer-actions">
						<DownloadCsv
							statType={ statType }
							query={ query }
							path={ path }
							borderless
							period={ period }
						/>
					</div>
				) }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const { statType, query } = ownProps;

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		siteSlug,
	};
} )( localize( StatsModule ) );
