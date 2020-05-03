/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteStatsViewSummary } from 'state/stats/lists/selectors';
import { Card } from '@automattic/components';
import Months from './months';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import StatsModulePlaceholder from '../stats-module/placeholder';

/**
 * Style dependencies
 */
import './style.scss';

class StatsViews extends Component {
	static propTypes = {
		query: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		statType: PropTypes.string,
		translate: PropTypes.func,
		viewData: PropTypes.object,
	};

	state = {
		chartOption: 'total',
	};

	toggleViews = ( option ) => {
		this.setState( {
			chartOption: option.value,
		} );
	};

	render() {
		const { query, siteId, statType, viewData, translate, siteSlug } = this.props;
		const monthViewOptions = [
			{ value: 'total', label: translate( 'Months and Years' ) },
			{ value: 'average', label: translate( 'Average per Day' ) },
		];

		return (
			<div>
				{ siteId && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				<Card className={ classNames( 'stats-views', { 'is-loading': ! viewData } ) }>
					<StatsModulePlaceholder isLoading={ ! viewData } />
					{ viewData && (
						<SimplifiedSegmentedControl
							className="stats-views__month-control"
							options={ monthViewOptions }
							onSelect={ this.toggleViews }
							compact
						/>
					) }
					<Months dataKey={ this.state.chartOption } data={ viewData } siteSlug={ siteSlug } />
					<div className="stats-views__key-container">
						<span className="stats-views__key-label">
							{ translate( 'Fewer Views', {
								context: 'Legend label in stats all time views table',
							} ) }
						</span>
						<ul className="stats-views__key">
							<li className="stats-views__key-item level-1" />
							<li className="stats-views__key-item level-2" />
							<li className="stats-views__key-item level-3" />
							<li className="stats-views__key-item level-4" />
							<li className="stats-views__key-item level-5" />
						</ul>
						<span className="stats-views__key-label">
							{ translate( 'More Views', {
								context: 'Legend label in stats all time views table',
							} ) }
						</span>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const query = { quantity: -1, stat_fields: 'views' };
	const statType = 'statsVisits';
	const siteId = getSelectedSiteId( state );

	return {
		viewData: getSiteStatsViewSummary( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		query,
		statType,
		siteId,
	};
} )( localize( StatsViews ) );
