/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { isRequestingActiveTheme } from 'calypso/state/themes/selectors';

class QueryActiveTheme extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		requestActiveTheme: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( props.siteId && ! props.isRequesting ) {
			props.requestActiveTheme( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isRequesting: isRequestingActiveTheme( state, siteId ),
	} ),
	{ requestActiveTheme }
)( QueryActiveTheme );
