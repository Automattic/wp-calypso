/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWhois } from 'state/domains/management/actions';
import { isRequestingWhois } from 'state/selectors';

class QueryWhois extends Component {
	componentWillMount() {
		if ( this.props.isRequesting ) {
			return;
		}
		this.props.requestWhois( this.props.domain );
	}

	render() {
		return null;
	}
}

QueryWhois.propTypes = {
	domain: PropTypes.string.isRequired,
	isRequesting: PropTypes.bool.isRequired,
	requestWhois: PropTypes.func.isRequired
};

export default connect(
	( state, { domain } ) => ( { isRequesting: isRequestingWhois( state, domain ) } ),
	{ requestWhois }
)( QueryWhois );
