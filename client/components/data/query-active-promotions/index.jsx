/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';
import { requestActivePromotions } from 'state/active-promotions/actions';

class QueryActivePromotions extends Component {
	UNSAFE_componentWillMount() {
		if ( ! this.props.requestingActivePromotions ) {
			this.props.requestActivePromotions();
		}
	}

	render() {
		return null;
	}
}

QueryActivePromotions.propTypes = {
	requestingActivePromotions: PropTypes.bool,
	requestActivePromotions: PropTypes.func,
};

QueryActivePromotions.defaultProps = {
	requestPlans: () => {},
};

export default connect(
	state => {
		return {
			requestingPlans: isRequestingActivePromotions( state ),
		};
	},
	{ requestActivePromotions }
)( QueryActivePromotions );
