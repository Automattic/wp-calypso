import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { includes, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_FEATURE_DOWNLOAD_CSV } from '../constants';
import Geochart from '../geochart';
import { shouldGateStats } from '../hooks/use-should-gate-stats';
import StatsCardUpsell from '../stats-card-upsell';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import DownloadCsvUpsell from '../stats-download-csv-upsell';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from './placeholder';

import './style.scss';
import '../stats-list/style.scss'; // TODO: limit included CSS and remove this import.

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
		metricLabel: PropTypes.string,
		mainItemLabel: PropTypes.string,
		additionalColumns: PropTypes.object,
		listItemClassName: PropTypes.string,
		gateStats: PropTypes.bool,
		gateDownloads: PropTypes.bool,
		hasNoBackground: PropTypes.bool,
		skipQuery: PropTypes.bool,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {},
	};

	state = {
		loaded: false,
	};

	componentDidUpdate( prevProps ) {
		if ( ! this.props.requesting && prevProps.requesting ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: true } );
		}

		if ( ! isEqual( this.props.query, prevProps.query ) ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: false } );
		}
	}

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.props.moduleStrings.title;
		}
		const { period, startOf } = this.props.period;
		const { path, query } = this.props;

		return <DatePicker period={ period } date={ startOf } path={ path } query={ query } summary />;
	}

	getSummaryLink() {
		const { summary, period, path, siteSlug, query } = this.props;
		if ( summary ) {
			return;
		}

		const paramsValid = period && path && siteSlug;
		if ( ! paramsValid ) {
			return undefined;
		}

		let url = `/stats/${ period.period }/${ path }/${ siteSlug }`;

		if ( query?.start_date ) {
			url += `?startDate=${ query.start_date }&endDate=${ query.date }`;
		} else {
			url += `?startDate=${ period.endOf.format( 'YYYY-MM-DD' ) }`;
		}

		return url;
	}

	isAllTimeList() {
		const { summary, statType } = this.props;
		const summarizedTypes = [
			'statsCountryViews',
			'statsTopPosts',
			'statsSearchTerms',
			'statsClicks',
			'statsReferrers',
			// statsEmailsOpen and statsEmailsClick are not used. statsEmailsSummary are used at the moment,
			// besides this, email page uses separate summary component: <StatsEmailSummary />
			'statsEmailsOpen',
			'statsEmailsClick',
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
			statType,
			query,
			period,
			translate,
			useShortLabel,
			metricLabel,
			additionalColumns,
			mainItemLabel,
			listItemClassName,
			gateStats,
			gateDownloads,
			hasNoBackground,
			skipQuery,
			titleNodes,
		} = this.props;

		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );

		// TODO: Support error state in redux store
		const hasError = false;

		const displaySummaryLink = data && ! this.props.hideSummaryLink;
		const isAllTime = this.isAllTimeList();
		const footerClass = clsx( 'stats-module__footer-actions', {
			'stats-module__footer-actions--summary': summary,
		} );

		return (
			<>
				{ ! skipQuery && siteId && statType && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				<StatsListCard
					className={ clsx( className, 'stats-module__card', path ) }
					moduleType={ path }
					data={ data }
					useShortLabel={ useShortLabel }
					title={ this.props.moduleStrings?.title }
					titleNodes={ titleNodes }
					emptyMessage={ moduleStrings.empty }
					metricLabel={ metricLabel }
					showMore={
						displaySummaryLink && ! summary
							? {
									url: this.getSummaryLink(),
									label:
										data.length >= 10
											? translate( 'View all', {
													context: 'Stats: Button link to show more detailed stats information',
											  } )
											: translate( 'View details', {
													context: 'Stats: Button label to see the detailed content of a panel',
											  } ),
							  }
							: undefined
					}
					error={ hasError && <ErrorPanel /> }
					loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
					heroElement={
						path === 'countryviews' && <Geochart query={ query } skipQuery={ skipQuery } />
					}
					additionalColumns={ additionalColumns }
					splitHeader={ !! additionalColumns }
					mainItemLabel={ mainItemLabel }
					showLeftIcon={ path === 'authors' }
					listItemClassName={ listItemClassName }
					hasNoBackground={ hasNoBackground }
					overlay={
						siteId &&
						statType &&
						gateStats && (
							<StatsCardUpsell
								className="stats-module__upsell"
								statType={ statType }
								siteId={ siteId }
							/>
						)
					}
				/>
				{ isAllTime && (
					<div className={ footerClass }>
						{ gateDownloads ? (
							<DownloadCsvUpsell siteId={ siteId } borderless />
						) : (
							<DownloadCsv
								statType={ statType }
								query={ query }
								path={ path }
								borderless
								period={ period }
								skipQuery={ skipQuery }
							/>
						) }
					</div>
				) }
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const { statType, query } = ownProps;
	const gateStats = shouldGateStats( state, siteId, statType );
	const gateDownloads = shouldGateStats( state, siteId, STATS_FEATURE_DOWNLOAD_CSV );

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		siteSlug,
		gateStats,
		gateDownloads,
	};
} )( localize( StatsModule ) );
