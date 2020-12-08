/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteVouchers } from 'calypso/state/sites/vouchers/selectors';
import { requestSiteVouchers as requestVouchers } from 'calypso/state/sites/vouchers/actions';

class QuerySiteVouchers extends Component {
	constructor( props ) {
		super( props );
		this.requestVouchers = this.requestVouchers.bind( this );
	}

	UNSAFE_componentWillMount() {
		this.requestVouchers();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.requestingSiteVouchers ||
			! nextProps.siteId ||
			this.props.siteId === nextProps.siteId
		) {
			return;
		}
		this.requestVouchers( nextProps );
	}

	requestVouchers( props = this.props ) {
		if ( ! props.requestingSiteVouchers && props.siteId ) {
			props.requestVouchers( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySiteVouchers.propTypes = {
	siteId: PropTypes.number,
	requestingVouchers: PropTypes.bool,
	requestVouchers: PropTypes.func,
};

QuerySiteVouchers.defaultProps = {
	requestVouchers: () => {},
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteVouchers: isRequestingSiteVouchers( state, ownProps.siteId ),
		};
	},
	{ requestVouchers }
)( QuerySiteVouchers );
