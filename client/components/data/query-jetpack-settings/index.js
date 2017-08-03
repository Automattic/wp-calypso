/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJetpackSettings } from 'state/selectors';
import { fetchSettings } from 'state/jetpack/settings/actions';

class QueryJetpackSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSettings: PropTypes.bool,
		fetchSettings: PropTypes.func
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
		if ( props.requestingSettings ) {
			return;
		}

		props.fetchSettings( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSettings: isRequestingJetpackSettings( state, ownProps.siteId )
		};
	},
	{ fetchSettings }
)( QueryJetpackSettings );
