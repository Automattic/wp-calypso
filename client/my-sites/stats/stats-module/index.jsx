import config from '@automattic/calypso-config';
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
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Geochart from '../geochart';
import DatePicker from '../stats-date-picker';
import DownloadCsv from '../stats-download-csv';
import ErrorPanel from '../stats-error';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsListCard from '../stats-list/stats-list-card';
import AllTimeNav from './all-time-nav';
import StatsModuleAvailabilityWarning from './availability-warning';
import StatsModuleExpand from './expand';
import StatsModulePlaceholder from './placeholder';

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
			'statsEmailsOpen',
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
			hideNewModule, // remove when cleaning 'stats/horizontal-bars-everywhere' FF
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
		const displaySummaryLink = data && ! this.props.hideSummaryLink;
		const isAllTime = this.isAllTimeList();
		const headerClass = classNames( 'stats-module__header', {
			'is-refreshing': requesting && ! isLoading,
		} );

		const isHorizontalBarComponentEnabledEverywhere = config.isEnabled(
			'stats/horizontal-bars-everywhere'
		);

		// the first part of the condition keeps the bars on the Traffic page but not on the Insights page or details summary pages
		// the second is a FF enabling the bars everywhere. Delete this comment when cleaning 'stats/horizontal-bars-everywhere' FF (and probably the whole variable)
		const shouldShowNewModule =
			( ! summary && ! hideNewModule ) || isHorizontalBarComponentEnabledEverywhere;

		return (
			<>
				{ siteId && statType && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				{ shouldShowNewModule && (
					<>
						{ isAllTime && <AllTimeNav path={ path } query={ query } period={ period } /> }
						<StatsListCard
							moduleType={ path }
							data={ data }
							useShortLabel={ useShortLabel }
							title={ this.getModuleLabel() }
							emptyMessage={ moduleStrings.empty }
							showMore={
								displaySummaryLink && ! summary
									? {
											url: this.getHref(),
											label:
												data.length >= 10
													? this.props.translate( 'View all', {
															context: 'Stats: Button link to show more detailed stats information',
													  } )
													: this.props.translate( 'View details', {
															context: 'Stats: Button label to see the detailed content of a panel',
													  } ),
									  }
									: undefined
							}
							error={ hasError && <ErrorPanel /> }
							loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
							heroElement={ path === 'countryviews' && <Geochart query={ query } /> }
						/>
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
					</>
				) }

				{ ! shouldShowNewModule && (
					<div className={ `stats__module-wrapper stats__module-wrapper--${ path }` }>
						{ ! isAllTime && (
							<SectionHeader
								className={ headerClass }
								label={ this.getModuleLabel() }
								href={ ! summary ? summaryLink : null }
							>
								{ summary && (
									<DownloadCsv
										statType={ statType }
										query={ query }
										path={ path }
										period={ period }
									/>
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
							<div className="stats__list-wrapper">
								<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
								<StatsModulePlaceholder isLoading={ isLoading } />
								<StatsList moduleName={ path } data={ data } useShortLabel={ useShortLabel } />
							</div>
							{ this.props.showSummaryLink && data?.length >= 10 && (
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
				) }
			</>
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
