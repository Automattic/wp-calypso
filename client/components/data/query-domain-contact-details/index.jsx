/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingDomainContactDetails } from 'state/selectors/is-requesting-domain-contact-details';
import { requestDomainContactDetails } from 'state/domains/management/actions';

class QueryDomainContactDetails extends Component {
	componentWillMount() {
		if ( ! this.props.requesting ) {
			this.props.requestDomainContactDetails();
		}
	}

	render() {
		return null;
	}
}

QueryDomainContactDetails.propTypes = {
	requesting: PropTypes.bool,
	requestDomainContactDetails: PropTypes.func
};

export default connect(
	( state ) => ( { requesting: isRequestingDomainContactDetails( state ) } ),
	{ requestDomainContactDetails }
)( QueryDomainContactDetails );
