/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchingPreferences } from 'state/preferences/selectors';
import { fetchPreferences } from 'state/preferences/actions';

class QueryPreferences extends Component {

	componentWillMount() {
		if ( ! this.props.fetchingPreferences ) {
			this.props.fetchPreferences();
		}
	}

	render() {
		return null;
	}
}

QueryPreferences.propTypes = {
	fetchingPreferences: PropTypes.bool,
	fetchPreferences: PropTypes.func
};

QueryPreferences.defaultProps = {
	fetchPreferences: () => {},
	fetchingPreferences: false
};

export default connect(
	( state ) => ( { fetchingPreferences: fetchingPreferences( state ) } ),
	{ fetchPreferences }
)( QueryPreferences );
