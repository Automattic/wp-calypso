/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestOlark } from 'state/ui/olark/actions';
import { isRequestingOlark } from 'state/ui/olark/selectors';

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
