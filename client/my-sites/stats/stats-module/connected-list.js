/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ErrorPanel from '../stats-error';
import StatsModuleExpand from './expand';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import DatePicker from '../stats-date-picker';
import Card from 'components/card';
import StatsModulePlaceholder from './placeholder';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
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
		showSummaryLink: PropTypes.bool
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {}
	};

	getModuleLabel() {
		if ( ! this.props.summary ) {
			return this.props.moduleStrings.title;
		}

		return ( <DatePicker period={ this.props.period.period } date={ this.props.period.startOf } summary={ true } /> );
	}

	getHref() {
		const { summary, period, path, siteSlug, date } = this.props;

		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return '/stats/' + period.period + '/' + path + '/' + siteSlug + '?startDate=' + date;
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
			query
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
				<SectionHeader label={ this.getModuleLabel() } href={ ! summary ? summaryLink : null } />
				<Card compact className={ cardClasses }>
					{ noData && <ErrorPanel message={ moduleStrings.empty } /> }
					{ hasError && <ErrorPanel /> }
					<StatsListLegend value={ moduleStrings.value } label={ moduleStrings.item } />
					<StatsModulePlaceholder isLoading={ isLoading } />
					<StatsList moduleName={ path } data={ data } />
					{ this.props.showSummaryLink && <StatsModuleExpand href={ summaryLink } /> }
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
} )( StatsConnectedModule );
