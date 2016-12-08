/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestActiveTheme } from 'state/themes/actions';
import { isRequestingActiveTheme } from 'state/themes/selectors';

class QueryActiveTheme extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		requestActiveTheme: PropTypes.func.isRequired,
	}

	componentDidMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.isRequesting ) {
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
