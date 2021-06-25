/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';

class QueryJetpackModules extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingModules: PropTypes.bool,
		fetchModuleList: PropTypes.func,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
			requestingModules: isFetchingJetpackModules( state, ownProps.siteId ),
		};
	},
	{ fetchModuleList }
)( QueryJetpackModules );
