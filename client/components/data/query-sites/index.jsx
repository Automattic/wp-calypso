/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingSites } from 'state/sites/selectors';
import { requestSites } from 'state/sites/actions';

class QuerySites extends Component {

	componentWillMount() {
		if ( ! this.props.requestingSites ) {
			this.props.requestSites();
		}
	}

	render() {
		return null;
	}
}

QuerySites.propTypes = {
	requestingSites: PropTypes.bool,
	requestSites: PropTypes.func
};

QuerySites.defaultProps = {
	requestSites: () => {}
};

export default connect(
	( state ) => {
		return {
			requestingSites: isRequestingSites( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestSites
		}, dispatch );
	}
)( QuerySites );
