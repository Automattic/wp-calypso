/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestContactDetailsCache } from 'state/domains/management/actions';
import { getContactDetailsCache, isRequestingContactDetailsCache } from 'state/selectors';

class QueryContactDetailsCache extends Component {
	componentWillMount() {
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
	requestContactDetailsCache: PropTypes.func.isRequired
};

export default connect(
	( state ) => ( {
		contactDetailsCache: getContactDetailsCache( state ),
		isRequesting: isRequestingContactDetailsCache( state ),
	} ),
	{ requestContactDetailsCache }
)( QueryContactDetailsCache );
