import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import { getSiteStatsViewSummary } from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Months from './months';

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
			{ value: 'total', label: translate( 'Months and years' ) },
			{ value: 'average', label: translate( 'Average per day' ) },
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
								context: 'Legend label in stats all-time views table',
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
								context: 'Legend label in stats all-time views table',
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
