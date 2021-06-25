/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTheme } from 'calypso/state/themes/actions';
import { isRequestingTheme } from 'calypso/state/themes/selectors';

class QueryTheme extends Component {
	static propTypes = {
		siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] )
			.isRequired,
		themeId: PropTypes.string.isRequired,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		requestTheme: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId && this.props.themeId === nextProps.themeId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.isRequesting ) {
			props.requestTheme( props.themeId, props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, themeId } ) => ( {
		isRequesting: isRequestingTheme( state, siteId, themeId ),
	} ),
	{ requestTheme }
)( QueryTheme );
