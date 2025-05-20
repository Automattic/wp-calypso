import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { login } from 'calypso/lib/paths';
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
	if ( redirectTo && redirectTo.includes( '/reader/subscriptions' ) ) {
		return EmailType.ManageSubscription;
	}

	if ( redirectTo && redirectTo.includes( 'activate=' ) ) {
		return EmailType.ConfirmSubscription;
	}

	return false;
};

class EmailedLoginLinkExpired extends Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
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
		if ( emailType === EmailType.ConfirmSubscription ) {
			this.handleResponse(
				resendSubscriptionConfirmationEmail(
					this.state.emailAddress,
					this.state.postId,
					this.state.activate
				)
			);
		}
		if ( emailType === EmailType.ManageSubscription ) {
			this.handleResponse(
				resendSubscriptionManagementEmail( this.state.emailAddress, this.state.token )
			);
		}
	};

	handleResponse( promise ) {
		const { translate } = this.props;
		const errorMessages = getResendEmailErrorMessages( translate );

		promise
			.then( () => {
				this.setCheckEmailText();
			} )
			.catch( ( error ) => {
				this.props.errorNotice( errorMessages[ error.code ] );
			} );
	}

	setLoggingExpiredText = () => {
		const { translate } = this.props;
		this.setState( {
			title: translate( 'Link expired or invalid' ),
			actionUrl: login( { twoFactorAuthType: 'link', emailAddress: this.props.emailAddress } ),
			secondaryAction: translate( 'Enter a password instead' ),
			secondaryActionURL: login( { emailAddress: this.props.emailAddress } ),
			line: translate(
				'The login link you used has either expired or is no longer valid. No worries - it happens! You can request a new link to log in.'
			),
			action: translate( 'Send new login link' ),
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
				<RedirectWhenLoggedIn delayAtMount={ 3500 } redirectTo="/" replaceCurrentLocation />
				<div className="magic-login__gutenboarding-wordpress-logo">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519938 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0ZM11.3684 13.9895H5.40632L11.3684 2.35579V13.9895ZM12.5811 21.6189V9.98526H18.5621L12.5811 21.6189Z"
							fill="#069E08"
						/>
					</svg>
				</div>
				<EmptyContent
					action={ action }
					actionCallback={ this.onClickTryAgainLink }
					actionURL={ actionUrl }
					className="magic-login__link-expired"
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
