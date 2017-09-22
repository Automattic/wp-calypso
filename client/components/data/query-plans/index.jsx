/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPlans } from 'state/plans/actions';
import { isRequestingPlans } from 'state/plans/selectors';

class QueryPlans extends Component {
	componentWillMount() {
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
	requestPlans: PropTypes.func
};

QueryPlans.defaultProps = {
	requestPlans: () => {}
};

export default connect(
	state => {
		return {
			requestingPlans: isRequestingPlans( state )
		};
	},
	{ requestPlans }
)( QueryPlans );
