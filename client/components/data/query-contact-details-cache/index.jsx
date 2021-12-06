import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import isRequestingContactDetailsCache from 'calypso/state/selectors/is-requesting-contact-details-cache';

class QueryContactDetailsCache extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
