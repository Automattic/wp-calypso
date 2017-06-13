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
		if ( this.props.requesting ) {
			return;
		}
		this.props.requestContactDetailsCache();
	}

	render() {
		return null;
	}
}

QueryContactDetailsCache.propTypes = {
	requesting: PropTypes.bool,
	requestContactDetailsCache: PropTypes.func
};

export default connect(
	( state ) => ( { requesting: isRequestingContactDetailsCache( state ) } ),
	{ requestContactDetailsCache }
)( QueryContactDetailsCache );
