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
		if ( this.props.requesting ) {
			return;
		}
		this.props.requestWhois( this.props.domain );
	}

	render() {
		return null;
	}
}

QueryWhois.propTypes = {
	domain: PropTypes.string,
	requesting: PropTypes.bool,
	requestWhois: PropTypes.func
};

export default connect(
	( state, { domain } ) => ( { requesting: isRequestingWhois( state, domain ) } ),
	{ requestWhois }
)( QueryWhois );
