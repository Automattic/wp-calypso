/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isCountryStatesFetching } from 'calypso/state/country-states/selectors';
import { requestCountryStates } from 'calypso/state/country-states/actions';

class QueryCountryStates extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.countryCode !== prevProps.countryCode ) {
			this.request();
		}
	}

	request() {
		if ( ! this.props.isRequesting ) {
			this.props.requestCountryStates( this.props.countryCode );
		}
	}

	render() {
		return null;
	}
}

QueryCountryStates.propTypes = {
	countryCode: PropTypes.string.isRequired,
	isRequesting: PropTypes.bool,
	requestCountryStates: PropTypes.func,
};

export default connect(
	( state, { countryCode } ) => ( {
		isRequesting: isCountryStatesFetching( state, countryCode ),
	} ),
	{ requestCountryStates }
)( QueryCountryStates );
