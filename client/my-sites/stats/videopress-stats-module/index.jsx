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
		const headerClass = classNames( 'stats-module__header', {
			'is-refreshing': requesting && ! isLoading,
		} );

		const editVideo = ( postId ) => {
			page( `/media/${ siteSlug }/${ postId }` );
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

		return (
			<div>
				<SectionHeader
					className={ headerClass }
					label={ this.getModuleLabel() }
					href={ ! summary ? summaryLink : null }
				>
					{ summary && (
						<DownloadCsv
							statType={ statType }
							data={ completeVideoStats }
							query={ query }
							path={ path }
							period={ period }
						/>
					) }
				</SectionHeader>
				<Card compact className={ cardClasses }>
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }

					<div className="videopress-stats-module__grid">
						<div className="videopress-stats-module__header-row-wrapper">
							<div className="videopress-stats-module__grid-header">{ 'Title' }</div>
							<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
								{ 'Impressions' }
							</div>
							<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
								{ 'Hours Watched' }
							</div>
							<div className="videopress-stats-module__grid-header videopress-stats-module__grid-metric">
								{ 'Views' }
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
		siteId,
		siteSlug,
	};
} )( localize( VideoPressStatsModule ) );
