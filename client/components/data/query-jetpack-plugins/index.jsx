import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPlugins } from 'calypso/state/plugins/installed/actions';
import { isRequestingForSites } from 'calypso/state/plugins/installed/selectors';

class QueryJetpackPlugins extends Component {
	static propTypes = {
		siteIds: PropTypes.arrayOf(
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired
		).isRequired,
		isRequestingForSites: PropTypes.bool,
		fetchPlugins: PropTypes.func,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		if ( this.props.siteIds && ! this.props.isRequestingForSites ) {
			this.props.fetchPlugins( this.props.siteIds );
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( isEqual( nextProps.siteIds, this.props.siteIds ) ) {
			return;
		}
		this.refresh( nextProps.isRequestingForSites, nextProps.siteIds );
	}

	refresh( isRequesting, siteIds ) {
		if ( ! isRequesting ) {
			this.props.fetchPlugins( siteIds );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, props ) => {
		return {
			isRequestingForSites: isRequestingForSites( state, props.siteIds ),
		};
	},
	{ fetchPlugins }
)( QueryJetpackPlugins );
