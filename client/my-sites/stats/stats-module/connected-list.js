/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

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
		translate: PropTypes.func,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {}
	};

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.props.moduleStrings.title;
		}

		return (
			<DatePicker
				period={ this.props.period.period }
				date={ this.props.period.startOf }
				path={ this.props.path }
				summary={ true } />
			);
	}

	getHref() {
		const { summary, period, path, siteSlug } = this.props;

		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return '/stats/' + period.period + '/' + path + '/' + siteSlug + '?startDate=' + period.startOf.format( 'YYYY-MM-DD' );
		}
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
		} = this.props;

		const noData = (
			data &&
			! requesting &&
			! data.length
		);

		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = requesting && ! ( data && data.length );

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

		return (
			<div>
				{ siteId && statType && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				<SectionHeader label={ this.getModuleLabel() } href={ ! summary ? summaryLink : null }>
					{ summary && <DownloadCsv statType={ statType } query={ query } path={ path } period={ period } /> }
				</SectionHeader>
				<Card compact className={ cardClasses }>
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }
					{ this.props.children }
					<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
					<StatsModulePlaceholder isLoading={ isLoading } />
					<StatsList moduleName={ path } data={ data } />
					{ this.props.showSummaryLink && <StatsModuleExpand href={ summaryLink } /> }
					{ summary && 'countryviews' === path &&
						<UpgradeNudge
							title={ translate( 'Add Google Analytics' ) }
							message={ translate( 'Upgrade to a Business Plan for Google Analytics integration.' ) }
							event="googleAnalytics-stats-countries"
							feature="google-analytics"
						/>
					}
				</Card>
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
		siteSlug
	};
} )( localize( StatsConnectedModule ) );
