/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingPreferences } from 'state/preferences/selectors';
import { fetchPreferences } from 'state/preferences/actions';

class QueryPreferences extends Component {

	componentWillMount() {
		if ( ! this.props.isFetchingPreferences ) {
			this.props.fetchPreferences();
		}
	}

	render() {
		return null;
	}
}

QueryPreferences.propTypes = {
	requestingSites: PropTypes.bool,
	fetchPreferences: PropTypes.func
};

QueryPreferences.defaultProps = {
	fetchPreferences: () => {}
};

export default connect(
	( state ) => ( { isFetchingPreferences: isFetchingPreferences( state ) } ),
	{ fetchPreferences }
)( QueryPreferences );
