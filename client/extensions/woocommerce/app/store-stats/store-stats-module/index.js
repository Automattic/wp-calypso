/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QuerySiteStats from 'components/data/query-site-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';
import StatsModulePlaceholder from 'my-sites/stats/stats-module/placeholder';
import ErrorPanel from 'my-sites/stats/stats-error';

class StoreStatsModule extends Component {
	static propTypes = {
		children: PropTypes.node,
		data: PropTypes.array,
		emptyMessage: PropTypes.string,
		header: PropTypes.node,
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
	};

	state = {
		loaded: false
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.requesting && this.props.requesting ) {
			this.setState( { loaded: true } );
		}

		if ( ! isEqual( nextProps.query, this.props.query ) && this.state.loaded ) {
			this.setState( { loaded: false } );
		}
	}

	render() {
		const { siteId, statType, header, query, children, data, emptyMessage } = this.props;
		const { loaded } = this.state;
		const isLoading = ! loaded && ! ( data && data.length );
		const hasEmptyData = loaded && data && data.length === 0;
		return (
			<div>
				{ siteId && statType && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				{ header }
				{ isLoading && <Card><StatsModulePlaceholder isLoading={ isLoading } /></Card> }
				{ ! isLoading && hasEmptyData && <Card><ErrorPanel message={ emptyMessage } /></Card> }
				{ ! isLoading && ! hasEmptyData && children }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, statType, query } ) => {
		return {
			data: getSiteStatsNormalizedData( state, siteId, statType, query ),
			requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		};
	}
)( StoreStatsModule );
