import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { includes, isEqual } from 'lodash';
import moment from 'moment';
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
		valueField: PropTypes.string,
		formatValue: PropTypes.func,
		minutesLimit: PropTypes.number,
		isRealTime: PropTypes.bool,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {},
		valueField: 'value',
		minutesLimit: 30,
		isRealTime: false,
	};

	state = {
		loaded: false,
		diffData: [],
		dataHistory: [],
		lastUpdated: null,
	};

	componentDidUpdate( prevProps ) {
		const { data, isRealTime, query, requesting, statType } = this.props;
		if ( ! requesting && prevProps.requesting ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: true } );
		}

		if ( ! isEqual( query, prevProps.query ) ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: false } );
		}

		if ( ! isRealTime ) {
			return;
		}

		// Limit data processing to avoid spurious updates.
		const { dataHistory, lastUpdated } = this.state;
		const UPDATE_THRESHOLD_IN_SECONDS = 15;
		const now = moment();

		if ( ! lastUpdated || now.diff( lastUpdated, 'seconds' ) >= UPDATE_THRESHOLD_IN_SECONDS ) {
			const updatedHistory = this.updateHistory( dataHistory, data );
			const diffData = this.calculateDiff( updatedHistory, statType );
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				diffData,
				dataHistory: updatedHistory,
				lastUpdated: now,
			} );
		}
	}

	updateHistory( history, data ) {
		// Timestamp the new data snapshot.
		const now = moment();
		const newSnapshot = {
			timestamp: now,
			data: data,
		};

		// Filter out snapshots older than minutesLimit prop.
		// This determines the baseline for the diff calculation.
		const { minutesLimit } = this.props;
		const filteredHistory = [ ...history, newSnapshot ].filter(
			( snapshot ) => now.diff( snapshot.timestamp, 'minutes' ) <= minutesLimit
		);

		return this.compactHistory( filteredHistory );
	}

	compactHistory( history ) {
		const MAX_HISTORY_LENGTH = 35;

		if ( history.length > MAX_HISTORY_LENGTH ) {
			// Keep every other entry to keep memory usage low.
			return history.filter( ( _, index ) => index % 2 === 0 );
		}

		return history;
	}

	calculateDiff( history, statType ) {
		const key = this.getKeyForStatType( statType );
		const baselineMap = this.createBaselineLookupMap( history, key );
		const lastSnapshot = history[ history.length - 1 ].data;

		return lastSnapshot.map( ( item ) => {
			const baselineItem = baselineMap.get( item[ key ] ) || { value: 0 };
			return {
				...item,
				diffValue: item.value - baselineItem.value,
			};
		} );
	}

	createBaselineLookupMap( history, key = 'id' ) {
		const lookup = new Map();

		history.forEach( ( snapshot ) => {
			snapshot.data.forEach( ( item ) => {
				if ( ! lookup.has( item[ key ] ) ) {
					lookup.set( item[ key ], item );
				}
			} );
		} );

		return lookup;
	}

	getKeyForStatType( statType ) {
		// Provided data is not consistent across modules.
		// Ideally we'd have an interface with some common properties.
		// For now we can't assume an 'id' for all stats types.
		// Use this function to find the best available key for unique identification.
		const keys = {
			statsTopPosts: 'id',
			statsReferrers: 'label',
			statsCountryViews: 'countryCode',
		};
		return keys[ statType ] || 'id';
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

		const paramsValid = period?.period && path && siteSlug;
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
			'statsTopPosts',
			'statsSearchTerms',
			'statsClicks',
			'statsReferrers',
			'statsTopAuthors',
			'statsFileDownloads',
			// statsEmailsOpen and statsEmailsClick are not used. statsEmailsSummary are used at the moment,
			// besides this, email page uses separate summary component: <StatsEmailSummary />
			'statsEmailsOpen',
			'statsEmailsClick',
		];
		return summary && includes( summarizedTypes, statType );
	}

	remapData() {
		const { valueField, isRealTime } = this.props;
		const data = isRealTime ? this.state.diffData : this.props.data;

		// TODO: Handle items with children.
		// For now, we remove any children to avoid view counts out of context.

		if ( isRealTime ) {
			return data
				.filter( ( item ) => item.diffValue !== 0 )
				.sort( ( a, b ) => {
					// Primary sort: diffValue (high to low)
					if ( b.diffValue !== a.diffValue ) {
						return b.diffValue - a.diffValue;
					}
					// Secondary sort: label (alphabetically)
					return ( a.label || '' ).localeCompare( b.label || '' );
				} )
				.map( ( item ) => ( {
					...item,
					value: item.diffValue || 0,
					children: null,
				} ) );
		}

		if ( valueField && data ) {
			return data.map( ( item ) => ( {
				...item,
				value: item[ valueField ],
			} ) );
		}

		return [];
	}

	render() {
		const {
			className,
			summary,
			siteId,
			path,
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
			formatValue,
			isRealTime,
		} = this.props;

		const data = this.remapData();

		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );

		// TODO: Support error state in redux store
		const hasError = false;

		const summaryLink = ! this.props.hideSummaryLink && this.getSummaryLink();
		const displaySummaryLink = data && summaryLink;
		const isAllTime = this.isAllTimeList();
		const isStatsNavigationImprovementEnabled = config.isEnabled( 'stats/navigation-improvement' );

		const renderDownloadCsv = () => {
			// Disable the Download button for the new navigation.
			if ( isStatsNavigationImprovementEnabled ) {
				return null;
			}

			// Disable for the email module as it doesn't work correctly.
			if ( statType === 'statsEmailsSummary' ) {
				return null;
			}

			if ( gateDownloads ) {
				return <DownloadCsvUpsell siteId={ siteId } borderless />;
			}

			return (
				<DownloadCsv
					statType={ statType }
					query={ query }
					path={ path }
					borderless
					period={ period }
					skipQuery={ skipQuery }
				/>
			);
		};

		const downloadCsv = renderDownloadCsv();

		const emptyMessage = isRealTime ? 'gathering info…' : moduleStrings.empty;
		// TODO: Translate empty message
		// But not yet as this is just a placeholder for now.

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
					downloadCsv={ downloadCsv }
					emptyMessage={ emptyMessage }
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
						path === 'countryviews' && (
							<Geochart query={ query } skipQuery={ skipQuery } isRealTime={ isRealTime } />
						)
					}
					additionalColumns={ additionalColumns }
					splitHeader={ !! additionalColumns }
					multiHeader={ isAllTime }
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
					formatValue={ formatValue }
				/>
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
