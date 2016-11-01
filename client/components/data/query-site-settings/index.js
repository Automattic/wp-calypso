/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteSettings } from 'state/site-settings/selectors';
import { requestSiteSettings } from 'state/site-settings/actions';

class QuerySiteSettings extends Component {
	componentWillMount() {
		const { requestingSiteSettings, siteId } = this.props;
		if ( ! requestingSiteSettings && siteId ) {
			this.props.requestSiteSettings( siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		nextProps.requestSiteSettings( nextProps.siteId );
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
