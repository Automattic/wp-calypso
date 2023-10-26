import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { login, lostPassword } from 'calypso/lib/paths';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { withEnhancers } from 'calypso/state/utils';
import {
	getResendEmailErrorMessages,
	resendSubscriptionConfirmationEmail,
	resendSubscriptionManagementEmail,
} from './resend-email';

const EmailType = {
	ManageSubscription: 'manage-subscription',
	ConfirmSubscription: 'confirm-subscription',
};

const getEmailType = ( redirectTo ) => {
	if ( redirectTo && redirectTo.includes( '/read/subscriptions' ) ) {
		return EmailType.ManageSubscription;
	}

	if ( redirectTo && redirectTo.includes( 'redirect_to_blog_post_id' ) ) {
		return EmailType.ConfirmSubscription;
	}

	return false;
};

class EmailedLoginLinkExpired extends Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		isGravPoweredClient: PropTypes.bool.isRequired,
		redirectTo: PropTypes.string,
		transition: PropTypes.bool,
		token: PropTypes.string,
		emailAddress: PropTypes.string,
		activate: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = { showEmailSentAgain: false };
		this.redirectTo = props.redirectTo;
		this.isTransitingToWPComAccount = props.transition;
		this.emailType = getEmailType( this.redirectTo );
		this.emailAddress = props.emailAddress;
		this.postId = props.postId;
		this.token = props.token;
		this.activate = props.activate;
		this.dispatch = props.dispatch;

		// Set values to shown to the user
		if ( this.isTransitingToWPComAccount ) {
			this.setTransitingText( this.emailType );
		} else {
			this.setLoggingExpiredText();
		}
	}

	componentDidMount() {
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );

		if ( this.props.isGravPoweredClient ) {
			document
				.querySelector( '.is-grav-powered-login-page' )
				?.classList.remove( 'is-grav-powered-login-page' );
		}
	}

	onClickTryAgainLink = () => {
		if ( this.isTransitingToWPComAccount ) {
			// Call the endpoint to resend the email
			this.resendEmail( this.emailType );
		} else {
			this.props.hideMagicLoginRequestForm();
		}
	};

	resendEmail = ( emailType ) => {
		const { translate } = this.props;
		const errorMessages = getResendEmailErrorMessages( translate );

		if ( emailType === EmailType.ConfirmSubscription ) {
			resendSubscriptionConfirmationEmail( this.emailAddress, this.postId, this.activate )
				.then( () => {
					this.props.successNotice( 'Tu acción ha sido completada exitosamente!' );
				} )
				.catch( ( error ) => {
					this.props.errorNotice( errorMessages[ error.code ] );
				} );
		}
		if ( emailType === EmailType.ManageSubscription ) {
			resendSubscriptionManagementEmail();
		}
	};

	setLoggingExpiredText = () => {
		const { translate } = this.props;

		this.title = translate( 'Login link is expired or invalid' );
		this.actionUrl = login( { twoFactorAuthType: 'link' } );
		this.secondaryAction = translate( 'Reset my password' );
		this.secondaryActionURL = lostPassword();
		this.line = translate( 'Maybe try resetting your password instead' );
	};

	setTransitingText = () => {
		const { translate } = this.props;

		if ( this.emailType === EmailType.ConfirmSubscription ) {
			this.title = translate( 'Your Subscription Confirmation link is expired or invalid' );
		} else {
			this.title = translate( 'Your Subscription Management link is expired or invalid' );
		}
		this.actionUrl = null;
		this.secondaryAction = null;
		this.secondaryActionURL = null;
		this.line = translate( 'Click on this button and we will send you a new link' );
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>

				<EmptyContent
					action={ translate( 'Try again' ) }
					actionCallback={ this.onClickTryAgainLink }
					actionURL={ this.actionUrl }
					className="magic-login__link-expired"
					illustration=""
					line={ this.line }
					secondaryAction={ this.secondaryAction }
					secondaryActionURL={ this.secondaryActionURL }
					title={ this.title }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	successNotice,
	errorNotice,
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
