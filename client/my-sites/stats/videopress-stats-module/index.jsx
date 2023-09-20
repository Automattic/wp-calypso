import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { numberFormat, localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import {
	isRequestingSiteStatsForQuery,
	getVideoPressPlaysComplete,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import AllTimeNav from '../stats-module/all-time-nav';
import StatsModulePlaceholder from '../stats-module/placeholder';

import '../stats-module/style.scss';
import './style.scss';

class VideoPressStatsModule extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		moduleStrings: PropTypes.object,
		period: PropTypes.object,
		path: PropTypes.string,
		siteSlug: PropTypes.string,
		siteId: PropTypes.number,
		data: PropTypes.object,
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

	componentDidUpdate( prevProps ) {
		if ( ! this.props.requesting && prevProps.requesting ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: true } );
		}

		if ( this.props.query !== prevProps.query && this.state.loaded ) {
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

	render() {
		const {
			className,
			summary,
			path,
			data,
			moduleStrings,
			requesting,
			statType,
			query,
			period,
			siteSlug,
			translate,
			siteAdminUrl,
		} = this.props;

		let completeVideoStats = [];
		if ( data && data.days ) {
			completeVideoStats = Object.values( data.days )
				.map( ( o ) => o.data )
				.flat();
		}

		const noData = data && this.state.loaded && ! completeVideoStats.length;
		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );
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
		const headerClass = classNames( 'stats-module__header', {
			'is-refreshing': requesting && ! isLoading,
		} );

		const editVideo = ( postId ) => {
			const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
			if ( ! isOdysseyStats ) {
				page( `/media/${ siteSlug }/${ postId }` );
				return;
			}
			// If it's Odyssey, redirect user to media lib page.
			location.href = `${ siteAdminUrl }upload.php?item=${ postId }`;
		};

		const showStat = ( queryStatType, row ) => {
			const url = `/stats/${ data.period }/videodetails/${ siteSlug }?post=${ row.post_id }&statType=${ queryStatType }`;

			recordTracksEvent( 'calypso_video_stats_details_clicked', {
				blog_id: this.props.siteId,
				post_id: row.post_id,
				stat_type: queryStatType,
				period: data.period,
			} );

			page( url );
		};

		const isNewVideoPage = config.isEnabled( 'stats/new-video-summary' );

		const csvData = [
			[ 'post_id', 'title', 'views', 'impressions', 'watch_time', 'retention_rate' ],
			...completeVideoStats,
		];
		const downloadCSV = (
			<div className="stats-module__heaver-nav-button">
				<DownloadCsv
					statType={ statType }
					data={ csvData }
					query={ query }
					path={ path }
					period={ period }
				/>
			</div>
		);

		const normalisedData = completeVideoStats?.map( ( item ) => {
			return {
				period: data.period, // need for a URL and is taken from the main props!
				post_id: item.post_id, // need for a URL
				label: item.title,
				value: item.views,
				impressions: numberFormat( item.impressions ),
				watch_time:
					item.watch_time > 1 ? numberFormat( item.watch_time, 1 ) : `< ${ numberFormat( 1, 1 ) }`,
				retention_rate: item.retention_rate,
			};
		} );

		return (
			<>
				{ isNewVideoPage && (
					<>
						<AllTimeNav
							path={ path }
							query={ query }
							period={ period }
							hideNavigation
							navigationSwap={ downloadCSV }
						/>
						<StatsListCard
							moduleType={ path }
							data={ normalisedData }
							title={ this.props.moduleStrings?.title }
							emptyMessage={ moduleStrings.empty }
							showMore={ false }
							error={ hasError && <ErrorPanel /> }
							loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
							splitHeader
							mainItemLabel={ <span>{ translate( 'Video' ) }</span> }
							additionalColumns={ {
								header: (
									<>
										<span>{ translate( 'Impressions' ) }</span>
										<span>{ translate( 'Hours watched' ) }</span>
										<span>{ translate( 'Retention Rate' ) }</span>
									</>
								),
								body: ( item ) => (
									<>
										{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
										<span
											onClick={ () => showStat( 'impressions', item ) }
											onKeyUp={ () => showStat( 'impressions', item ) }
										>
											{ item.impressions }
										</span>
										{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
										<span
											onClick={ () => showStat( 'watch_time', item ) }
											onKeyUp={ () => showStat( 'watch_time', item ) }
										>
											{ item.watch_time }
										</span>
										{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
										<span
											onClick={ () => showStat( 'retention_rate', item ) }
											onKeyUp={ () => showStat( 'retention_rate', item ) }
										>
											{ 0 === item.value ? 'n/a' : `${ item.retention_rate }%` }
										</span>
									</>
								),
							} }
						/>
					</>
				) }
				{ ! isNewVideoPage && (
					<div>
						<SectionHeader
							className={ headerClass }
							label={ this.getModuleLabel() }
							href={ ! summary ? summaryLink : null }
						>
							{ summary && (
								<DownloadCsv
									statType={ statType }
									data={ csvData }
									query={ query }
									path={ path }
									period={ period }
								/>
							) }
						</SectionHeader>
						<Card compact className={ cardClasses }>
							<div className="videopress-stats-module__grid">
								<div className="videopress-stats-module__header-row-wrapper">
									<div className="videopress-stats-module__grid-header">
										{ translate( 'Title' ) }
									</div>
									<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
										{ translate( 'Impressions' ) }
									</div>
									<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
										{ translate( 'Hours Watched' ) }
									</div>
									<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
										{ translate( 'Retention Rate' ) }
									</div>
									<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
										{ translate( 'Views' ) }
									</div>
								</div>
								{ completeVideoStats.map( ( row, index ) => (
									<div
										key={ 'videopress-stats-row-' + index }
										className="videopress-stats-module__row-wrapper"
									>
										<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-link">
											<span
												onClick={ () => editVideo( row.post_id ) }
												onKeyUp={ () => editVideo( row.post_id ) }
												tabIndex="0"
												role="button"
											>
												{ row.title }
											</span>
										</div>
										<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-metric">
											<span
												onClick={ () => showStat( 'impressions', row ) }
												onKeyUp={ () => showStat( 'impressions', row ) }
												tabIndex="0"
												role="button"
											>
												{ numberFormat( row.impressions ) }
											</span>
										</div>
										<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-metric">
											<span
												onClick={ () => showStat( 'watch_time', row ) }
												onKeyUp={ () => showStat( 'watch_time', row ) }
												tabIndex="0"
												role="button"
											>
												{ row.watch_time > 1
													? numberFormat( row.watch_time, 1 )
													: `< ${ numberFormat( 1, 1 ) }` }
											</span>
										</div>
										<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-metric">
											<span
												onClick={ () => showStat( 'retention_rate', row ) }
												onKeyUp={ () => showStat( 'retention_rate', row ) }
												tabIndex="0"
												role="button"
											>
												{ 0 === row.value ? 'n/a' : `${ row.retention_rate }%` }
											</span>
										</div>
										<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-metric">
											<span
												onClick={ () => showStat( 'views', row ) }
												onKeyUp={ () => showStat( 'views', row ) }
												tabIndex="0"
												role="button"
											>
												{ numberFormat( row.views ) }
											</span>
										</div>
									</div>
								) ) }
							</div>
							{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
							{ hasError && <ErrorPanel /> }
							<StatsModulePlaceholder isLoading={ isLoading } />
						</Card>
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

	query.complete_stats = 1;

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getVideoPressPlaysComplete( state, siteId, statType, query ),
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		siteId,
		siteSlug,
	};
} )( localize( VideoPressStatsModule ) );
