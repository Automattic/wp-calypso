/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
import { requestThemes } from 'state/themes/actions';
import { isRequestingThemesForQuery } from 'state/themes/selectors';

class QueryThemes extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		query: PropTypes.object,
		// Connected props
		isJetpackSite: PropTypes.bool.isRequired,
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
			let siteId = { props };
			if ( ! props.isJetpackSite ) {
				siteId = 'wpcom';
			}
			props.requestThemes( siteId, props.query );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { query, siteId } ) => ( {
		isJetpackSite: !! isJetpackSite( state, siteId ),
		isRequesting: isRequestingThemesForQuery( state, siteId || 'wpcom', query ),
	} ),
	{ requestThemes }
)( QueryThemes );
