import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
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

	getMaxValue( data, field ) {
		if ( ! data || ! data.length ) {
			return 0;
		}
		return Math.max( ...data.map( ( item ) => item[ field ] || 0 ) );
	}

	renderTitleCell( title, views, maxViews, onClick, onKeyUp ) {
		const fillPercentage = maxViews > 0 ? ( views / maxViews ) * 100 : 0;
		return (
			<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-link">
				<div className="videopress-stats-module__bar-wrapper">
					<div
						className="videopress-stats-module__bar"
						style={ { '--bar-fill-percentage': `${ fillPercentage }%` } }
					>
						<span onClick={ onClick } onKeyUp={ onKeyUp } tabIndex="0" role="button">
							{ title }
						</span>
					</div>
				</div>
			</div>
		);
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

		const cardClasses = clsx(
			'stats-module',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': noData,
			},
			className
		);

		const summaryLink = this.getHref();
		const headerClass = clsx( 'stats-module__header', {
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

		const csvData = [
			[ 'post_id', 'title', 'views', 'impressions', 'watch_time', 'retention_rate' ],
			...completeVideoStats,
		];

		// Calculate max views only
		const maxViews = this.getMaxValue( completeVideoStats, 'views' );

		return (
			<div>
				{ summary && (
					<div className="stats-module__date-picker-header">
						<h3>
							<DatePicker
								period={ period.period }
								date={ period.startOf }
								path={ path }
								query={ query }
								summary
							/>
						</h3>
					</div>
				) }
				<Card compact className={ cardClasses }>
					<SectionHeader
						className={ headerClass }
						label={
							<div className="stats-card-header__title" role="heading" aria-level="4">
								<div>{ moduleStrings.title }</div>
								<div className="stats-card-header__title-nodes">
									<InfoPopover className="stats-info-area__popover" iconSize={ 24 } position="top">
										{ translate( 'View detailed statistics about your videos.' ) }
									</InfoPopover>
								</div>
							</div>
						}
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
					<div className="videopress-stats-module__grid">
						<div className="videopress-stats-module__header-row-wrapper">
							<div className="videopress-stats-module__grid-header">{ translate( 'Title' ) }</div>
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
								{ this.renderTitleCell(
									row.title,
									row.views,
									maxViews,
									() => editVideo( row.post_id ),
									() => editVideo( row.post_id )
								) }
								<div className="videopress-stats-module__grid-cell videopress-stats-module__grid-metric">
									<span
										onClick={ () => showStat( 'impressions', row ) }
										onKeyUp={ () => showStat( 'impressions', row ) }
										tabIndex="0"
										role="button"
									>
										{ formatNumber( row.impressions ) }
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
											? formatNumber( row.watch_time, { decimals: 1 } )
											: `< ${ formatNumber( 1, { decimals: 1 } ) }` }
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
										{ formatNumber( row.views ) }
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
