import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Geochart from '../geochart';
import StatsCardUpsell from '../stats-card-upsell';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
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
			// statsEmailsOpen and statsEmailsClick are not used. statsEmailsSummary and statsEmailsSummaryByOpens are used at the moment,
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
			needsUpgrade,
		} = this.props;

		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );

		// TODO: Support error state in redux store
		const hasError = false;

		const displaySummaryLink = data && ! this.props.hideSummaryLink;
		const isAllTime = this.isAllTimeList();
		const footerClass = classNames( 'stats-module__footer-actions', {
			'stats-module__footer-actions--summary': summary,
		} );

		return (
			<>
				{ siteId && statType && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				<div
					className={ classNames( 'stats-module__wrapper', {
						'stats-module__wrapper--needs-upgrade': needsUpgrade,
						[ `stats-module__wrapper--${ path }` ]: true,
					} ) }
				>
					<StatsListCard
						className={ classNames( className, 'stats-module__card', path ) }
						moduleType={ path }
						data={ data }
						useShortLabel={ useShortLabel }
						title={ this.props.moduleStrings?.title }
						emptyMessage={ moduleStrings.empty }
						metricLabel={ metricLabel }
						showMore={
							displaySummaryLink && ! summary
								? {
										url: this.getHref(),
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
						heroElement={ path === 'countryviews' && <Geochart query={ query } /> }
						additionalColumns={ additionalColumns }
						splitHeader={ !! additionalColumns }
						mainItemLabel={ mainItemLabel }
						showLeftIcon={ path === 'authors' }
						listItemClassName={ listItemClassName }
					/>
					{ needsUpgrade && <StatsCardUpsell className="stats-module__upsell" /> }
				</div>
				{ isAllTime && (
					<div className={ footerClass }>
						<DownloadCsv
							statType={ statType }
							query={ query }
							path={ path }
							borderless
							period={ period }
						/>
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
	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const siteHasPaidStats = siteHasFeature( state, siteId, FEATURE_STATS_PAID );
	let needsUpgrade = false;
	const paidStats = [ 'statsSearchTerms', 'statsClicks', 'statsReferrers', 'statsCountryViews' ];
	if ( isPaidStatsEnabled && ! siteHasPaidStats && paidStats.includes( statType ) ) {
		needsUpgrade = true;
	}

	if ( paidStats.includes( statType ) ) {
		needsUpgrade = true;
	}

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		siteSlug,
		isPaidStatsEnabled,
		siteHasPaidStats,
		needsUpgrade,
	};
} )( localize( StatsModule ) );
