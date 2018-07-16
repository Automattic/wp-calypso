/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWordadsStats } from 'state/wordads/stats/actions';

class QuerySiteWordAdsStats extends Component {
	static propTypes = {
		requestWordadsStats: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		statType: PropTypes.string.isRequired,
		query: PropTypes.object,
	};

	static defaultProps = {
		query: {},
		requestWordadsStats: () => {},
	};

	componentDidMount() {
		const { siteId, statType, query } = this.props;
		this.props.requestWordadsStats( siteId, statType, query );
	}

	componentDidUpdate( prevProps ) {
		const { siteId, statType, query } = this.props;

		if (
			siteId !== prevProps.siteId ||
			statType !== prevProps.statType ||
			query !== prevProps.query
		) {
			this.props.requestWordadsStats( siteId, statType, query );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestWordadsStats }
)( QuerySiteWordAdsStats );
