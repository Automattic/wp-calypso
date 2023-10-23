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
import { withEnhancers } from 'calypso/state/utils';

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
	};

	constructor( props ) {
		super( props );
		this.state = { showEmailSentAgain: false };
		this.redirectTo = props.redirectTo;
		this.isTransitingToWPComAccount = props.transition;
		this.emailType = getEmailType( this.redirectTo );
		const { translate } = this.props;

		// Set values to shown to the user
		if ( this.isTransitingToWPComAccount ) {
			if ( this.emailType === EmailType.ConfirmSubscription ) {
				this.title = translate( 'Your Subscription Confirmation link is expired or invalid' );
			} else {
				this.title = translate( 'Your Subscription Management link is expired or invalid' );
			}
			this.actionUrl = null;
			this.secondaryAction = null;
			this.secondaryActionURL = null;
			this.line = translate( 'Click on this button and we will send you a new link' );
		} else {
			this.title = translate( 'Login link is expired or invalid' );
			this.actionUrl = login( { twoFactorAuthType: 'link' } );
			this.secondaryAction = translate( 'Reset my password' );
			this.secondaryActionURL = lostPassword();
			this.line = translate( 'Maybe try resetting your password instead' );
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
			this.setState( { showAlternateContent: true } );
		} else {
			this.props.hideMagicLoginRequestForm();
		}
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
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
