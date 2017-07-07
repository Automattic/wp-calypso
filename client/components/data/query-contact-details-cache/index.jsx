/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getContactDetailsCache,
	isRequestingContactDetailsCache,
} from 'state/selectors';
import { requestContactDetailsCache } from 'state/domains/management/actions';

class QueryContactDetailsCache extends Component {
	componentWillMount() {
		const {
			isRequesting,
			contactDetailsCacheIsEmpty,
		} = this.props;

		if ( isRequesting || ! contactDetailsCacheIsEmpty ) {
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
	contactDetailsCacheIsEmpty: PropTypes.func.isRequired,
	requestContactDetailsCache: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		contactDetailsCacheIsEmpty: isEmpty( getContactDetailsCache( state ) ),
		isRequesting: isRequestingContactDetailsCache( state ),
	} ),
	{ requestContactDetailsCache }
)( QueryContactDetailsCache );
