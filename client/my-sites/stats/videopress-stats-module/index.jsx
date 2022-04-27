import { FEATURE_GOOGLE_ANALYTICS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SectionHeader from 'calypso/components/section-header';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	// getSiteStatsNormalizedData,
	getVideoPressPlaysComplete,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import AllTimeNav from './all-time-nav';
import StatsModuleAvailabilityWarning from './availability-warning';
import StatsModuleExpand from './expand';
import StatsModulePlaceholder from './placeholder';

import './style.scss';

class VideoPressStatsModule extends Component {
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

		console.log( data );

		// const noData = false;
		let completeVideoStats = [];
		if ( data && data.days ) {
			completeVideoStats = Object.values( data.days )
				.map( ( o ) => o.data )
				.flat();
			console.log( completeVideoStats );
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
		const isAllTime = this.isAllTimeList();
		const headerClass = classNames( 'stats-module__header', {
			'is-refreshing': requesting && ! isLoading,
		} );

		return (
			<div>
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
					{ isAllTime && <AllTimeNav path={ path } query={ query } period={ period } /> }
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }
					<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
					<ul className={ 'module-content-list foo' }>
						{ completeVideoStats.map( ( videoStat ) => {
							return <li className={ 'module-content-list-item' }>Stat</li>;
						} ) }
					</ul>
					<StatsModulePlaceholder isLoading={ isLoading } />
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

	query.complete_stats = 1;
	// const statType = 'statsVideoPlaysComplete';

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getVideoPressPlaysComplete( state, siteId, statType, query ),
		siteId,
		siteSlug,
	};
} )( localize( VideoPressStatsModule ) );
