/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import { requestSiteStats } from 'state/stats/lists/actions';
import { isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'state/stats/lists/utils';

class QuerySiteStats extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId === prevProps.siteId &&
				this.props.statType === prevProps.statType &&
				shallowEqual( this.props.query, prevProps.query ) ) {
			return;
		}
		this.request();
	}

	componentWillUnmount() {
		this.clearInterval();
	}

	request() {
		const { requesting, siteId, statType, query, heartbeat } = this.props;
		if ( requesting ) {
			return;
		}

		this.props.requestSiteStats( siteId, statType, query );
		this.clearInterval();
		if ( heartbeat, isAutoRefreshAllowedForQuery( query ) ) {
			this.interval = setInterval( () => {
				if ( ! this.props.requesting ) {
					this.props.requestSiteStats( siteId, statType, query );
				}
			}, heartbeat );
		}
	}

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
	heartbeat: PropTypes.number
};

QuerySiteStats.defaultProps = {
	query: {},
	heartbeat: 3 * 60 * 1000 // 3 minutes
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingSiteStatsForQuery( state, ownProps.siteId, ownProps.statType, ownProps.query )
		};
	},
	{
		requestSiteStats
	}
)( QuerySiteStats );
