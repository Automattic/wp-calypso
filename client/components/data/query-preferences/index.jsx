/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingPreferences } from 'state/preferences/selectors';
import { fetch } from 'state/preferences/actions';

class QueryPreferences extends Component {

	componentWillMount() {
		if ( ! this.props.isFetchingPreferences ) {
			this.props.fetch();
		}
	}

	render() {
		return null;
	}
}

QueryPreferences.propTypes = {
	requestingSites: PropTypes.bool,
	fetch: PropTypes.func
};

QueryPreferences.defaultProps = {
	fetch: () => {}
};

export default connect(
	( state ) => ( { isFetchingPreferences: isFetchingPreferences( state ) } ),
	{ fetch }
)( QueryPreferences );
