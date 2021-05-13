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
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.countryCode !== nextProps.countryCode ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( ! props.isRequesting ) {
			props.requestCountryStates( props.countryCode );
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
