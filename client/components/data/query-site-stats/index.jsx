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

class QuerySiteStats extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.statType === nextProps.statType &&
				shallowEqual( this.props.query, nextProps.query ) ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
			return;
		}

		props.requestSiteStats( props.siteId, props.statType, props.query );
	}

	shouldComponentUpdate() {
		return false;
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
	requestSiteStats: PropTypes.func.isRequired
};

QuerySiteStats.defaultProps = {
	query: {}
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
