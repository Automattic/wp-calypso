/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJetpackSettings } from 'state/selectors';
import { requestJetpackSettings } from 'state/jetpack/settings/actions';

class QueryJetpackSettings extends Component {
	static propTypes = {
		query: PropTypes.object,
		siteId: PropTypes.number,
		// Connected props
		requestingSettings: PropTypes.bool,
		requestJetpackSettings: PropTypes.func,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingSettings || ! props.siteId ) {
			return;
		}

		props.requestJetpackSettings( props.siteId, props.query );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { query, siteId } ) => ( {
		requestingSettings: isRequestingJetpackSettings( state, siteId, query ),
	} ),
	{ requestJetpackSettings }
)( QueryJetpackSettings );
