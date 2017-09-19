/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestGeo } from 'state/geo/actions';
import { isRequestingGeo } from 'state/geo/selectors';

class QueryGeo extends Component {
	componentWillMount() {
		if ( ! this.props.requesting ) {
			this.props.requestGeo();
		}
	}

	render() {
		return null;
	}
}

QueryGeo.propTypes = {
	requesting: PropTypes.bool,
	requestGeo: PropTypes.func
};

export default connect(
	( state ) => ( { requesting: isRequestingGeo( state ) } ),
	{ requestGeo }
)( QueryGeo );
