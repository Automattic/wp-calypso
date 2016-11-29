/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingModules } from 'state/jetpack-settings/modules/selectors';
import { fetchModuleList } from 'state/jetpack-settings/modules/actions';

class QueryJetpackModules extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingModules: PropTypes.bool,
		fetchModuleList: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingModules ) {
			return;
		}

		props.fetchModuleList( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingModules: isFetchingModules( state, ownProps.siteId )
		};
	},
	{ fetchModuleList }
)( QueryJetpackModules );
