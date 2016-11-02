/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingHappinessEngineers } from 'state/happiness-engineers/selectors';
import { fetchHappinessEngineers } from 'state/happiness-engineers/actions';

class QueryHappinessEngineers extends Component {
	componentWillMount() {
		if ( ! this.props.isRequestingHappinessEngineers ) {
			this.props.fetchHappinessEngineers();
		}
	}

	render() {
		return null;
	}
}

QueryHappinessEngineers.propTypes = {
	isRequestingHappinessEngineers: PropTypes.bool,
	fetchHappinessEngineers: PropTypes.func
};

QueryHappinessEngineers.defaultProps = {
	fetchHappinessEngineers: () => {}
};

export default connect(
	state => {
		return {
			isRequestingHappinessEngineers: isRequestingHappinessEngineers( state )
		};
	},
	{ fetchHappinessEngineers }
)( QueryHappinessEngineers );
