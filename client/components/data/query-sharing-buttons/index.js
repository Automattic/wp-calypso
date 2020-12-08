/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingSharingButtons from 'calypso/state/selectors/is-requesting-sharing-buttons';
import { requestSharingButtons } from 'calypso/state/sites/sharing-buttons/actions';

class QuerySharingButtons extends Component {
	UNSAFE_componentWillMount() {
		this.requestSettings( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestSettings( nextProps );
	}

	requestSettings( props ) {
		const { requestingSharingButtons, siteId } = props;
		if ( ! requestingSharingButtons && siteId ) {
			props.requestSharingButtons( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySharingButtons.propTypes = {
	siteId: PropTypes.number,
	requestingSharingButtons: PropTypes.bool,
	requestSharingButtons: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSharingButtons: isRequestingSharingButtons( state, siteId ),
		};
	},
	{ requestSharingButtons }
)( QuerySharingButtons );
