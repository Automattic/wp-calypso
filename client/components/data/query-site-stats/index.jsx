import isShallowEqual from '@wordpress/is-shallow-equal';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	requestSiteStats,
	requestAllSiteStats,
	ALL_SITES_ID,
} from 'calypso/state/stats/lists/actions';
import { isRequestingSiteStatsForQuery } from 'calypso/state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'calypso/state/stats/lists/utils';
import { DEFAULT_HEARTBEAT } from './constants';

class QuerySiteStats extends Component {
	componentDidMount() {
		this.deferredTimer = defer( () => this.request() );
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.siteId === prevProps.siteId &&
			this.props.statType === prevProps.statType &&
			isShallowEqual( this.props.query, prevProps.query )
		) {
			return;
		}

		this.request();
	}

	componentWillUnmount() {
		this.clearInterval();
		clearTimeout( this.deferredTimer );
	}

	request() {
		const { requesting, siteId, statType, query, heartbeat } = this.props;
		if ( requesting ) {
			return;
		}

		if ( siteId === ALL_SITES_ID ) {
			this.props.requestAllSiteStats( statType, query );
		} else {
			this.props.requestSiteStats( siteId, statType, query );
		}

		this.clearInterval();
		if ( heartbeat && isAutoRefreshAllowedForQuery( query ) ) {
			this.interval = setInterval( this.heartbeatRequest, heartbeat );
		}
	}

	heartbeatRequest = () => {
		const { requesting, siteId, statType, query } = this.props;
		if ( ! requesting ) {
			if ( siteId === ALL_SITES_ID ) {
				this.props.requestAllSiteStats( statType, query );
			} else {
				this.props.requestSiteStats( siteId, statType, query );
			}
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

QuerySiteStats.propTypes = {
	siteId: PropTypes.number.isRequired,
	statType: PropTypes.string.isRequired,
	query: PropTypes.object,
	requesting: PropTypes.bool.isRequired,
	requestSiteStats: PropTypes.func.isRequired,
	requestAllSiteStats: PropTypes.func.isRequired,
	heartbeat: PropTypes.number,
};

QuerySiteStats.defaultProps = {
	query: {},
	heartbeat: DEFAULT_HEARTBEAT,
};

export default connect(
	( state, { siteId, statType, query } ) => ( {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	} ),
	{ requestSiteStats, requestAllSiteStats }
)( QuerySiteStats );
