/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteSettings } from 'state/site-settings/actions';
import { isRequestingSiteSettings } from 'state/site-settings/selectors';

class QuerySiteSettings extends Component {
	componentWillMount() {
		this.requestSettings( this.props );
	}

	componentWillReceiveProps( nextProps ) {
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
	requestSiteSettings: PropTypes.func
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSiteSettings: isRequestingSiteSettings( state, siteId )
		};
	},
	{ requestSiteSettings }
)( QuerySiteSettings );
