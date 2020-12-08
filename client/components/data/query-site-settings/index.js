/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteSettings } from 'calypso/state/site-settings/selectors';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';

class QuerySiteSettings extends Component {
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
		const { requestingSiteSettings, siteId } = props;
		if ( ! requestingSiteSettings && siteId ) {
			props.requestSiteSettings( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySiteSettings.propTypes = {
	siteId: PropTypes.number,
	requestingSiteSettings: PropTypes.bool,
	requestSiteSettings: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSiteSettings: isRequestingSiteSettings( state, siteId ),
		};
	},
	{ requestSiteSettings }
)( QuerySiteSettings );
