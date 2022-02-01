import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestJetpackUserConnectionData } from 'calypso/state/jetpack/connection/actions';
import isRequestingJetpackUserConnection from 'calypso/state/selectors/is-requesting-jetpack-user-connection';

class QueryJetpackUserConnection extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		// Connected props
		isRequesting: PropTypes.bool,
		requestJetpackUserConnectionData: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( props.siteId && ! props.isRequesting ) {
			props.requestJetpackUserConnectionData( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isRequesting: isRequestingJetpackUserConnection( state, siteId ),
	} ),
	{ requestJetpackUserConnectionData }
)( QueryJetpackUserConnection );
