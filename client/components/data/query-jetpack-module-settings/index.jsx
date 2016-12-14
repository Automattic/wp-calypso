/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingModuleSettings } from 'state/jetpack-settings/module-settings/selectors';
import { fetchModuleSettings } from 'state/jetpack-settings/module-settings/actions';

class QueryJetpackModuleSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		moduleSlug: PropTypes.string.isRequired,
		requestingModuleSettings: PropTypes.bool,
		fetchModuleSettings: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId || this.props.moduleSlug !== nextProps.moduleSlug ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingModuleSettings ) {
			return;
		}

		props.fetchModuleSettings( props.siteId, props.moduleSlug );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingModuleSettings: isRequestingModuleSettings( state, ownProps.siteId, ownProps.moduleSlug )
		};
	},
	{ fetchModuleSettings }
)( QueryJetpackModuleSettings );
