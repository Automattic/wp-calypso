/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingWordadsEarnings } from 'state/wordads/earnings/selectors';
import { requestWordadsEarnings } from 'state/wordads/earnings/actions';

class QueryWordadsEarnings extends Component {
	componentWillMount() {
		this.refreshSite( this.props.siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.refreshSite( nextProps.siteId );
		}
	}

	refreshSite( siteId ) {
		if ( ! this.props.isRequestingWordadsEarnings ) {
			this.props.requestWordadsEarnings( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryWordadsEarnings.propTypes = {
	isRequestingWordadsEarnings: PropTypes.bool,
	requestWordadsEarnings: PropTypes.func,
	siteId: PropTypes.number,
};

QueryWordadsEarnings.defaultProps = {
	requestWordadsEarnings: () => {},
};

export default connect(
	( state, props ) => ( {
		isRequestingWordadsEarnings: isRequestingWordadsEarnings( state, props.siteId ),
	} ),
	{ requestWordadsEarnings }
)( QueryWordadsEarnings );
