/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestThemes } from 'state/themes/actions';
import { isRequestingTheme } from 'state/themes/selectors';

class QueryTheme extends Component {
	static propTypes = {
		siteId: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.oneOf( [ 'wpcom' ] )
		] ).isRequired,
		query: PropTypes.object,
		// Connected props
		isRequesting: PropTypes.bool.isRequired,
		requestThemes: PropTypes.func.isRequired,
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
			props.requestThemes( props.siteId, props.query );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { query, siteId } ) => ( {
		isRequesting: isRequestingTheme( state, siteId, query ),
	} ),
	{ requestThemes }
)( QueryTheme );
