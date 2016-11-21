/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTheme } from 'state/themes/actions';
import { isRequestingTheme } from 'state/themes/selectors';

class QueryTheme extends Component {
	static propTypes = {
		siteId: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.oneOf( [ 'wpcom' ] )
		] ).isRequired,
		themeId: PropTypes.string.isRequired,
		query: PropTypes.object,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		requestTheme: PropTypes.func.isRequired,
	}

	componentDidMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				shallowEqual( this.props.query, nextProps.query ) ) {
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
