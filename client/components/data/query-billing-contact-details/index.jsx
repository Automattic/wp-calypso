/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import getBillingContactDetails from 'state/selectors/get-billing-contact-details';

import isRequestingBillingContactDetails from 'state/selectors/is-requesting-billing-contact-details';
import { requestBillingContactDetails } from 'state/billing-transactions/actions';

class QueryBillingContactDetails extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool.isRequired,
		requestBillingContactDetails: PropTypes.func.isRequired,
	};

	componentWillMount() {
		if ( this.props.isRequesting || ! isEmpty( this.props.contactDetails ) ) {
			return;
		}
		this.props.requestBillingContactDetails();
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		contactDetails: getBillingContactDetails( state ),
		isRequesting: isRequestingBillingContactDetails( state ),
	} ),
	{ requestBillingContactDetails }
)( QueryBillingContactDetails );
