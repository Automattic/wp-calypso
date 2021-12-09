import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isUserConnected } from 'calypso/state/jetpack-connect/actions';
import { isRequestingSite } from 'calypso/state/sites/selectors';

class QueryUserConnection extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.siteId && ! props.requestingSite ) {
			props.isUserConnected( props.siteId, props.siteIsOnSitesList );
		}
	}

	render() {
		return null;
	}
}

QueryUserConnection.propTypes = {
	siteId: PropTypes.number,
	siteIsOnSitesList: PropTypes.bool,
	requestingSite: PropTypes.bool,
	isUserConnected: PropTypes.func,
};

QueryUserConnection.defaultProps = {
	isUserConnected: () => {},
	siteIsOnSitesList: false,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSite: isRequestingSite( state, siteId ),
		};
	},
	{ isUserConnected }
)( QueryUserConnection );
