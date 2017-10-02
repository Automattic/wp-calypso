/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingPreferences } from 'state/preferences/selectors';
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
	( state ) => ( { fetchingPreferences: isFetchingPreferences( state ) } ),
	{ fetchPreferences }
)( QueryPreferences );
