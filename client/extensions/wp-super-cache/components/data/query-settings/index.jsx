/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSettings } from '../../../state/settings/selectors';
import { requestSettings } from '../../../state/settings/actions';

class QuerySettings extends Component {
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
		const { requestingSettings, siteId } = props;

		if ( ! requestingSettings && siteId ) {
			props.requestSettings( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySettings.propTypes = {
	siteId: PropTypes.number,
	requestingSettings: PropTypes.bool,
	requestSettings: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSettings: isRequestingSettings( state, siteId ),
		};
	},
	{ requestSettings }
)( QuerySettings );
