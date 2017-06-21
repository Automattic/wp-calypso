/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingContactDetailsCache } from 'state/selectors';
import { requestContactDetailsCache } from 'state/domains/management/actions';

class QueryContactDetailsCache extends Component {
	componentWillMount() {
		if ( this.props.isRequesting ) {
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
	( state ) => ( { isRequesting: isRequestingContactDetailsCache( state ) } ),
	{ requestContactDetailsCache }
)( QueryContactDetailsCache );
