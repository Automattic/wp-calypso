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
		this.state = {
			showEmailSentAgain: false,
			title: '',
			actionUrl: '',
			secondaryAction: '',
			secondaryActionURL: '',
			line: '',
			action: '',
			emailType: getEmailType( props.redirectTo ),
			isTransitingToWPComAccount: props.transition,
			emailAddress: props.emailAddress,
			postId: props.postId,
			token: props.token,
			activate: props.activate,
		};
	}

	componentDidMount() {
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );

		if ( this.props.isGravPoweredClient ) {
			document
				.querySelector( '.is-grav-powered-login-page' )
				?.classList.remove( 'is-grav-powered-login-page' );
		}

		// Set initial text
		if ( this.state.isTransitingToWPComAccount ) {
			this.setTransitingText();
		} else {
			this.setLoggingExpiredText();
		}
	}

	onClickTryAgainLink = () => {
		if ( this.state.isTransitingToWPComAccount ) {
			this.resendEmail( this.state.emailType );
		} else {
			this.props.hideMagicLoginRequestForm();
		}
	};

	resendEmail = ( emailType ) => {
		const { translate } = this.props;
		const errorMessages = getResendEmailErrorMessages( translate );

		if ( emailType === EmailType.ConfirmSubscription ) {
			resendSubscriptionConfirmationEmail(
				this.state.emailAddress,
				this.state.postId,
				this.state.activate
			)
				.then( () => {
					this.setCheckEmailText();
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
		this.setState( {
			title: translate( 'Login link is expired or invalid' ),
			actionUrl: login( { twoFactorAuthType: 'link' } ),
			secondaryAction: translate( 'Reset my password' ),
			secondaryActionURL: lostPassword(),
			line: translate( 'Maybe try resetting your password instead' ),
			action: translate( 'Try again' ),
		} );
	};

	setCheckEmailText = () => {
		const { translate } = this.props;
		this.setState( {
			title: translate( 'Check your email!' ),
			actionUrl: null,
			secondaryAction: null,
			secondaryActionURL: null,
			line: translate(
				"We've sent an email with a verification link to {{strong}}%(emailAddress)s{{/strong}}",
				{
					components: { strong: <strong /> },
					args: { emailAddress: this.state.emailAddress },
				}
			),
			action: '',
		} );
	};

	setTransitingText = () => {
		const { translate } = this.props;
		this.setState( {
			title:
				this.state.emailType === EmailType.ConfirmSubscription
					? translate( 'Your Subscription Confirmation link is expired or invalid' )
					: translate( 'Your Subscription Management link is expired or invalid' ),
			actionUrl: null,
			secondaryAction: null,
			secondaryActionURL: null,
			line: translate( 'Click on this button and we will send you a new link' ),
			action: translate( 'Try again' ),
		} );
	};

	render() {
		const { title, line, action, actionUrl, secondaryAction, secondaryActionURL } = this.state;

		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>

				<EmptyContent
					action={ action }
					actionCallback={ this.onClickTryAgainLink }
					actionURL={ actionUrl }
					className="magic-login__link-expired"
					illustration=""
					line={ line }
					secondaryAction={ secondaryAction }
					secondaryActionURL={ secondaryActionURL }
					title={ title }
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
