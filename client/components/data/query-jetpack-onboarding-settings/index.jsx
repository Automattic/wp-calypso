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
import { getRequest, getUnconnectedSite } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { requestJetpackSettings } from 'state/jetpack-onboarding/actions';

class QueryJetpackOnboardingSettings extends Component {
	static propTypes = {
		isConnected: PropTypes.bool,
		query: PropTypes.shape( {
			jpUser: PropTypes.string,
			token: PropTypes.number,
		} ),
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
	( state, { siteId } ) => {
		const isConnected = isJetpackSite( state, siteId );
		let query;

		if ( ! isConnected && getUnconnectedSite( state, siteId ) ) {
			const { token, jpUser } = getUnconnectedSite( state, siteId );
			query = {
				onboarding: {
					token,
					jpUser,
				},
			};
		}

		return {
			isConnected,
			query,
			requestingSettings: getRequest( state, requestJetpackSettings( siteId, query ) ).isLoading,
		};
	},
	{ requestJetpackSettings }
)( QueryJetpackOnboardingSettings );
