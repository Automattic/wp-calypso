/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingWhois } from 'state/selectors';
import { requestWhois } from 'state/domains/management/actions';

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
	requestWhois: PropTypes.func.isRequired,
};

export default connect(
	( state, { domain } ) => ( { isRequesting: isRequestingWhois( state, domain ) } ),
	{ requestWhois }
)( QueryWhois );
