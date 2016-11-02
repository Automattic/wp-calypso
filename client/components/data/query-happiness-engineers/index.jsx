/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequesting } from 'state/happiness-engineers/selectors';
import { fetchHappinessEngineers } from 'state/happiness-engineers/actions';

class QueryHappinessEngineers extends Component {
	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.fetchHappinessEngineers();
		}
	}

	render() {
		return null;
	}
}

QueryHappinessEngineers.propTypes = {
	isRequesting: PropTypes.bool,
	fetchHappinessEngineers: PropTypes.func
};

QueryHappinessEngineers.defaultProps = {
	fetchHappinessEngineers: () => {}
};

export default connect(
	state => {
		return {
			isRequesting: isRequesting( state )
		};
	},
	{ fetchHappinessEngineers }
)( QueryHappinessEngineers );
