/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteVouchers } from 'state/sites/vouchers/selectors';
import { requestSiteVouchers as requestVouchers } from 'state/sites/vouchers/actions';

class QuerySiteVouchers extends Component {

	constructor( props ) {
		super( props );
		this.requestVouchers = this.requestVouchers.bind( this );
	}

	componentWillMount() {
		this.requestVouchers();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingSiteVouchers ||
			! nextProps.siteId ||
			( this.props.siteId === nextProps.siteId ) ) {
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
	requestVouchers: PropTypes.func
};

QuerySiteVouchers.defaultProps = {
	requestVouchers: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteVouchers: isRequestingSiteVouchers( state, ownProps.siteId )
		};
	},
	{ requestVouchers }
)( QuerySiteVouchers );
