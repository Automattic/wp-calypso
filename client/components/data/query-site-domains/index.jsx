/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { fetchSiteDomains } from 'state/sites/domains/actions';

class QuerySiteDomains extends Component {
	constructor( props ) {
		super( props );
		this.requestSiteDomains = this.requestSiteDomains.bind( this );
	}

	componentWillMount() {
		this.requestSiteDomains();
	}

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.requestingSiteDomains ||
			! nextProps.siteId ||
			this.props.siteId === nextProps.siteId
		) {
			return;
		}
		this.requestSiteDomains( nextProps );
	}

	requestSiteDomains( props = this.props ) {
		if ( ! props.requestingSiteDomains && props.siteId ) {
			props.fetchSiteDomains( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySiteDomains.propTypes = {
	siteId: PropTypes.number,
	requestingSiteDomains: PropTypes.bool,
	fetchSiteDomains: PropTypes.func,
};

QuerySiteDomains.defaultProps = {
	fetchSiteDomains: () => {},
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteDomains: isRequestingSiteDomains( state, ownProps.siteId ),
		};
	},
	dispatch => {
		return bindActionCreators( { fetchSiteDomains }, dispatch );
	}
)( QuerySiteDomains );
