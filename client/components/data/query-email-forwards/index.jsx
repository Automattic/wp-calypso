/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingEmailForwards from 'calypso/state/selectors/is-requesting-email-forwards';
import { getEmailForwards } from 'calypso/state/email-forwarding/actions';

class QueryEmailForwards extends PureComponent {
	static propTypes = {
		domainName: PropTypes.string.isRequired,
		getEmailForwards: PropTypes.func.isRequired,
		requestingEmailForwards: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.domainName !== prevProps.domainName ) {
			this.request();
		}
	}

	request() {
		if ( ! this.props.requestingEmailForwards ) {
			this.props.getEmailForwards( this.props.domainName );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		requestingEmailForwards: isRequestingEmailForwards( state, ownProps.domainName ),
	} ),
	{ getEmailForwards }
)( QueryEmailForwards );
