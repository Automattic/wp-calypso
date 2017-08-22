/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate, localize } from 'i18n-calypso';
import cookie from 'cookie';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { setJpoConnect } from 'state/signup/steps/jpo-connect/actions';
import LoggedInForm from 'jetpack-connect/auth-logged-in-form';
import {
	getAuthorizationData,
	getAuthorizationRemoteSite,
	hasXmlrpcError,
	hasExpiredSecretError,
	getAuthAttempts,
} from 'state/jetpack-connect/selectors';
import {
	authorize,
	goBackToWpAdmin,
	retryAuth
} from 'state/jetpack-connect/actions';
import { urlToSlug } from 'lib/url';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class JPOConnectStep extends React.Component {

	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJpoConnect: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,

		// Properties for Connect
		authAttempts: PropTypes.number.isRequired,
		authorize: PropTypes.func.isRequired,
		goBackToWpAdmin: PropTypes.func.isRequired,
		jetpackConnectAuthorize: PropTypes.shape( {
			authorizeError: PropTypes.oneOfType( [
				PropTypes.object,
				PropTypes.bool,
			] ),
			authorizeSuccess: PropTypes.bool,
			isRedirectingToWpAdmin: PropTypes.bool,
			queryObject: PropTypes.shape( {
				already_authorized: PropTypes.bool,
				jp_version: PropTypes.string.isRequired,
				new_user_started_connection: PropTypes.bool,
				redirect_after_auth: PropTypes.string.isRequired,
				site: PropTypes.string.isRequired,
			} ).isRequired,
			siteReceived: PropTypes.bool,
		} ).isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		requestHasExpiredSecretError: PropTypes.func.isRequired,
		requestHasXmlrpcError: PropTypes.func.isRequired,
		retryAuth: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );
		this.renderStepContent = this.renderStepContent.bind( this );
		this.isSSO = this.isSSO.bind( this );
	}

	submitStep( jpoConnect ) {
		jpoConnect.siteSlug = this.props.siteSlug;
		this.props.setJpoConnect( jpoConnect );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Starting Jetpack engine!' ),
			stepName: this.props.stepName,
			jpoConnect,
		}, [], { jpoConnect } );
	}

	isSSO() {
		const cookies = cookie.parse( document.cookie );
		const query = this.props.jetpackConnectAuthorize.queryObject;
		return (
			query.from &&
			'sso' === query.from &&
			cookies.jetpack_sso_approved &&
			query.client_id &&
			query.client_id === cookies.jetpack_sso_approved
		);
	}

	renderStepContent() {
		return (
			<div className="jpo-connect__wrapper">
				<LoggedInForm
					{ ...this.props }
					isSSO={ this.isSSO() }
					/>
			</div>
		);
	}

	componentWillMount() {
		this.submitStep( this.props.jetpackConnectAuthorize );
	}

	render() {
		const headerText = translate( 'Congratulations! %s is on its way.', {
			args: get( this.props.signupProgress[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
		} );
		const subHeaderText = translate(
			'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing your site below.'
		);

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ false }
				/>
			</div>
		);
	}
}

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteSlug = urlToSlug( remoteSiteUrl );
		const requestHasExpiredSecretError = () => hasExpiredSecretError( state );
		const requestHasXmlrpcError = () => hasXmlrpcError( state );
		return {
			authAttempts: getAuthAttempts( state, siteSlug ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			requestHasExpiredSecretError,
			requestHasXmlrpcError,
			siteSlug,
			user: getCurrentUser( state )
		};
	},
	{
		setJpoConnect,
		authorize,
		goBackToWpAdmin,
		retryAuth,
		recordTracksEvent
	}
)( localize( JPOConnectStep ) );
