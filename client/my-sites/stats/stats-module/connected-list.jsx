/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize, moment } from 'i18n-calypso';
import { includes, merge } from 'lodash';

/**
 * Internal dependencies
 */
import ErrorPanel from '../stats-error';
import StatsModuleExpand from './expand';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import Card from 'components/card';
import StatsModulePlaceholder from './placeholder';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import AllTimeNav from './all-time-nav';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';

class StatsConnectedModule extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		moduleStrings: PropTypes.object,
		period: PropTypes.object,
		path: PropTypes.string,
		siteSlug: PropTypes.string,
		siteId: PropTypes.number,
		date: PropTypes.string,
		data: PropTypes.array,
		query: PropTypes.object,
		statType: PropTypes.string,
		showSummaryLink: PropTypes.bool,
		showPriorPeriodToggle: PropTypes.bool,
		priorPeriodQuery: PropTypes.object,
		priorPeriodData: PropTypes.array,
		translate: PropTypes.func,
	};

	static defaultProps = {
		showSummaryLink: false,
		showPriorPeriodToggle: false,
		query: {}
	};

	state = {
		showingPriorPeriod: false
	};

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
				summary={ true } />
			);
	}

	getHref() {
		const { summary, period, path, siteSlug, showPriorPeriodToggle, query, priorPeriodQuery } = this.props;
		let date = period.startOf.format( 'YYYY-MM-DD' );

		if ( showPriorPeriodToggle ) {
			date = this.state.showingPriorPeriod ? priorPeriodQuery.date : query.date;
		}

		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return '/stats/' + period.period + '/' + path + '/' + siteSlug + '?startDate=' + date;
		}
	}

	togglePeriod = ( value ) => {
		this.setState( {
			showingPriorPeriod: value
		} );
	}

	renderPeriodToggle() {
		// for now only support today/yesterday
		if ( this.props.period.period !== 'day' ) {
			return null;
		}

		const { showingPriorPeriod } = this.state;
		const { translate } = this.props;
		const showPrior = () => {
			this.togglePeriod( true );
		};

		const showCurrent = () => {
			this.togglePeriod( false );
		};

		return (
			<div className="stats-module__period-toggle">
				<SegmentedControl compact>
					<ControlItem selected={ ! showingPriorPeriod } onClick={ showCurrent }>
						{ translate( 'Today' ) }
					</ControlItem>
					<ControlItem selected={ showingPriorPeriod } onClick={ showPrior }>
						{ translate( 'Yesterday' ) }
					</ControlItem>
				</SegmentedControl>
			</div>
		);
	}

	isAllTimeList() {
		const { summary, statType } = this.props;
		return summary && includes( [ 'statsCountryViews', 'statsTopPosts' ], statType );
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
			showPriorPeriodToggle,
			priorPeriodQuery,
			priorPeriodData,
			requestingPriorPeriod,
		} = this.props;

		const noData = (
			data &&
			! requesting &&
			! data.length
		);

		const { showingPriorPeriod } = this.state;

		const loadingStatus = showingPriorPeriod ? requestingPriorPeriod : requesting;
		const listData = showingPriorPeriod ? priorPeriodData : data;
		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = loadingStatus && ! ( listData && listData.length );

		// TODO: Support error state in redux store
		const hasError = false;

		const cardClasses = classNames(
			'stats-module',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': noData
			},
			className
		);

		const summaryLink = this.getHref();
		const displaySummaryLink = listData && listData.length >= 10;
		const isAllTime = this.isAllTimeList();

		return (
			<div>
				{ siteId && statType && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				{ siteId && statType && showPriorPeriodToggle && showingPriorPeriod &&
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ priorPeriodQuery } /> }
				{ ! isAllTime &&
					<SectionHeader label={ this.getModuleLabel() } href={ ! summary ? summaryLink : null }>
						{ summary && <DownloadCsv statType={ statType } query={ query } path={ path } period={ period } /> }
					</SectionHeader>
				}
				<Card compact className={ cardClasses }>
					{ isAllTime && <AllTimeNav path={ path } query={ query } period={ period } /> }
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }
					{ this.props.children }
					{ showPriorPeriodToggle && this.renderPeriodToggle() }
					<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
					<StatsModulePlaceholder isLoading={ isLoading } />
					<StatsList moduleName={ path } data={ listData } />
					{ this.props.showSummaryLink && displaySummaryLink && <StatsModuleExpand href={ summaryLink } /> }
					{ summary && 'countryviews' === path &&
						<UpgradeNudge
							title={ translate( 'Add Google Analytics' ) }
							message={ translate( 'Upgrade to a Business Plan for Google Analytics integration.' ) }
							event="googleAnalytics-stats-countries"
							feature="google-analytics"
						/>
					}
				</Card>
				{ isAllTime &&
					<div className="stats-module__footer-actions">
						<DownloadCsv
							statType={ statType }
							query={ query }
							path={ path }
							borderless
							period={ period } />
					</div>
				}
			</div>

		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const { statType, query } = ownProps;
	let priorPeriodData;
	let priorPeriodQuery;
	let requestingPriorPeriod;

	// Fetch Prior Period
	if ( ownProps.showPriorPeriodToggle && ! ownProps.summary ) {
		priorPeriodQuery = merge( {}, query );
		priorPeriodQuery.date = moment( query.date ).locale( 'en' ).subtract( 1, 'd' ).format( 'YYYY-MM-DD' );
		requestingPriorPeriod = isRequestingSiteStatsForQuery( state, siteId, statType, priorPeriodQuery );
		priorPeriodData = getSiteStatsNormalizedData( state, siteId, statType, priorPeriodQuery );
	}

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		siteSlug,
		priorPeriodData,
		priorPeriodQuery,
		requestingPriorPeriod,
	};
} )( localize( StatsConnectedModule ) );
