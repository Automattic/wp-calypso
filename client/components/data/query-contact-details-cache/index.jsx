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
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';

import isRequestingContactDetailsCache from 'state/selectors/is-requesting-contact-details-cache';
import { requestContactDetailsCache } from 'state/domains/management/actions';

class QueryContactDetailsCache extends Component {
	UNSAFE_componentWillMount() {
		if ( this.props.isRequesting || ! isEmpty( this.props.contactDetailsCache ) ) {
			return;
		}
		this.props.requestContactDetailsCache();
	}

	render() {
		return null;
	}
}

QueryContactDetailsCache.propTypes = {
	isRequesting: PropTypes.bool.isRequired,
	requestContactDetailsCache: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		contactDetailsCache: getContactDetailsCache( state ),
		isRequesting: isRequestingContactDetailsCache( state ),
	} ),
	{ requestContactDetailsCache }
)( QueryContactDetailsCache );
