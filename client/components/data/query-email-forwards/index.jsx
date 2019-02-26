/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingEmailForwards from 'state/selectors/is-requesting-email-forwards';
import { requestEmailForwarding } from 'state/email-forwarding/actions';

class QueryEmailForwards extends PureComponent {
	static propTypes = {
		domainName: PropTypes.string.isRequired,
		requestEmailForwarding: PropTypes.func.isRequired,
		requestingEmailForwards: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		this.request();
	}

	request() {
		if ( ! this.props.requestingEmailForwards ) {
			this.props.requestEmailForwarding( this.props.domainName );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		const { domainName } = ownProps;
		return {
			requestingEmailForwards: isRequestingEmailForwards( state, domainName ),
		};
	},
	{ requestEmailForwarding }
)( QueryEmailForwards );
