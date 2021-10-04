import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SummaryChart from '../stats-summary';

class StatsVideoSummary extends Component {
	static propTypes = {
		query: PropTypes.object,
		isRequesting: PropTypes.bool,
		siteId: PropTypes.number,
		summaryData: PropTypes.object,
	};

	state = {
		selectedBar: null,
	};

	selectBar = ( bar ) => {
		this.setState( {
			selectedBar: bar,
		} );
	};

	render() {
		const { query, isRequesting, moment, siteId, summaryData, translate } = this.props;
		const data =
			summaryData && summaryData.data
				? summaryData.data.map( ( item ) => {
						return {
							...item,
							period: moment( item.period ).format( 'MMM D' ),
						};
				  } )
				: [];
		let selectedBar = this.state.selectedBar;
		if ( ! selectedBar && !! data.length ) {
			selectedBar = data[ data.length - 1 ];
		}

		return (
			<div>
				<QuerySiteStats siteId={ siteId } statType="statsVideo" query={ query } />
				<SummaryChart
					isLoading={ isRequesting && ! data.length }
					data={ data }
					activeKey="period"
					dataKey="value"
					labelKey="period"
					labelClass="video"
					sectionClass="is-video"
					selected={ selectedBar }
					onClick={ this.selectBar }
					tabLabel={ translate( 'Plays' ) }
				/>
			</div>
		);
	}
}

const connectComponent = connect( ( state, { postId } ) => {
	const query = { postId };
	const siteId = getSelectedSiteId( state );

	return {
		summaryData: getSiteStatsNormalizedData( state, siteId, 'statsVideo', query ),
		isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', query ),
		query,
		siteId,
	};
} );

export default flowRight( connectComponent, localize, withLocalizedMoment )( StatsVideoSummary );
