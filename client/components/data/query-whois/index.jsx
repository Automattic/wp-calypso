/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingWhois } from 'state/selectors/is-requesting-whois';
import { requestWhois } from 'state/domains/management/actions';

class QueryWhois extends Component {
	componentWillMount() {
		if ( ! this.props.requesting ) {
			this.props.requestWhois();
		}
	}

	render() {
		return null;
	}
}

QueryWhois.propTypes = {
	requesting: PropTypes.bool,
	requestWhois: PropTypes.func
};

export default connect(
	( state, domain ) => ( { requesting: isRequestingWhois( state, domain ) } ),
	{ requestWhois }
)( QueryWhois );
