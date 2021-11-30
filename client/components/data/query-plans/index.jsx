import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';
import { isRequestingPlans } from 'calypso/state/plans/selectors';

class QueryPlans extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		if ( ! this.props.requestingPlans ) {
			this.props.requestPlans();
		}
	}

	render() {
		return null;
	}
}

QueryPlans.propTypes = {
	requestingPlans: PropTypes.bool,
	requestPlans: PropTypes.func,
};

QueryPlans.defaultProps = {
	requestPlans: () => {},
};

export default connect(
	( state ) => {
		return {
			requestingPlans: isRequestingPlans( state ),
		};
	},
	{ requestPlans }
)( QueryPlans );
