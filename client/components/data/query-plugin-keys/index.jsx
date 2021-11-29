import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchInstallInstructions } from 'calypso/state/plugins/premium/actions';
import { hasRequested } from 'calypso/state/plugins/premium/selectors';

class QueryPluginKeys extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		if ( this.props.siteId && ! this.props.hasRequested ) {
			this.props.fetchInstallInstructions( this.props.siteId );
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId === this.props.siteId ) {
			return;
		}
		this.refresh( nextProps.hasRequested, nextProps.siteId );
	}

	refresh( hasRequestedKeys, siteId ) {
		if ( ! hasRequestedKeys ) {
			this.props.fetchInstallInstructions( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryPluginKeys.propTypes = {
	siteId: PropTypes.number.isRequired,
	hasRequested: PropTypes.bool,
	fetchInstallInstructions: PropTypes.func,
};

QueryPluginKeys.defaultProps = {
	fetchInstallInstructions: () => {},
};

export default connect(
	( state, props ) => {
		const siteId = props.siteId;
		return {
			hasRequested: hasRequested( state, siteId ),
		};
	},
	{ fetchInstallInstructions }
)( QueryPluginKeys );
