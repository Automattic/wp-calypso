/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingOlark } from 'state/ui/olark/selectors';
import { requestOlark } from 'state/ui/olark/actions';

class QueryOlark extends Component {

	componentWillMount() {
		if ( ! this.props.requestingOlark ) {
			this.props.requestOlark();
		}
	}

	render() {
		return null;
	}
}

QueryOlark.propTypes = {
	requestingOlark: PropTypes.bool,
	requestOlark: PropTypes.func
};

QueryOlark.defaultProps = {
	requestOlark: () => {}
};

export default connect(
	( state ) => {
		return {
			requestingOlark: isRequestingOlark( state )
		};
	},
	{ requestOlark }
)( QueryOlark );
