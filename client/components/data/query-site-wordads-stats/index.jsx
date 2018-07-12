/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import { requestSiteStats } from 'state/stats/lists/actions';
import { isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'state/stats/lists/utils';

class QuerySiteWordAdsStats extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId === nextProps.siteId &&
			this.props.statType === nextProps.statType &&
			shallowEqual( this.props.query, nextProps.query )
		) {
			return;
		}

		this.request( nextProps );
	}

	componentWillUnmount() {
		this.clearInterval();
	}

	request( props ) {
		const { requesting, siteId, statType, query, heartbeat } = props;
		if ( requesting ) {
			return;
		}

		props.requestSiteStats( siteId, statType, query );
		this.clearInterval();
		if ( heartbeat && isAutoRefreshAllowedForQuery( query ) ) {
			this.interval = setInterval( this.heartbeatRequest, heartbeat );
		}
	}

	heartbeatRequest = () => {
		const { requesting, siteId, statType, query } = this.props;
		if ( ! requesting ) {
			this.props.requestSiteStats( siteId, statType, query );
		}
	};

	clearInterval() {
		if ( this.interval ) {
			clearInterval( this.interval );
		}
	}

	render() {
		return null;
	}
}

QuerySiteWordAdsStats.propTypes = {
	siteId: PropTypes.number.isRequired,
	statType: PropTypes.string.isRequired,
	query: PropTypes.object,
	requesting: PropTypes.bool.isRequired,
	requestSiteStats: PropTypes.func.isRequired,
	heartbeat: PropTypes.number,
};

QuerySiteWordAdsStats.defaultProps = {
	query: {},
	heartbeat: 3 * 60 * 1000, // 3 minutes
};

export default connect(
	( state, { siteId, statType, query } ) => ( {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	} ),
	{ requestSiteStats }
)( QuerySiteWordAdsStats );
