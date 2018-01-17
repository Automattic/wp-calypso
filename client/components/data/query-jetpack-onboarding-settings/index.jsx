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
import { requestJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';
import { getRequest } from 'state/selectors';

class QueryJetpackOnboardingSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSettings: PropTypes.bool,
		requestJetpackOnboardingSettings: PropTypes.func,
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

		props.requestJetpackOnboardingSettings( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		requestingSettings: getRequest( state, requestJetpackOnboardingSettings( siteId ) ).isLoading,
	} ),
	{ requestJetpackOnboardingSettings }
)( QueryJetpackOnboardingSettings );
