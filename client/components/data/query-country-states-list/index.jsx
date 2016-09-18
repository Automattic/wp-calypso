/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { getCountryStatesList, isCountryStatesListFetching as isFetching } from 'state/country-states/selectors';
import { requestStatesList } from 'state/country-states/actions';

class QueryCountryStatesList extends Component {

	componentWillReceiveProps( nextProps ) {
		if ( this.props.countryCode !== nextProps.countryCode ) {
			this.props.requestStatesList( nextProps.countryCode );
		}
	}

	componentWillMount() {
		if ( ! this.props.isFetching ) {
			this.props.requestStatesList( this.props.countryCode );
		}
	}

	render() {
		return null;
	}
}

QueryCountryStatesList.propTypes = {
	countryCode: PropTypes.string,
	isFetching: PropTypes.bool,
	requestStatesList: PropTypes.func
};

export default connect( ( state, props ) => {
	const statesList = getCountryStatesList( state, props.countryCode );
	return {
		statesList,
		isFetching: isFetching( state )
	};
}, ( dispatch ) => {
	return bindActionCreators( {
		requestStatesList
	}, dispatch );
} )( QueryCountryStatesList );
