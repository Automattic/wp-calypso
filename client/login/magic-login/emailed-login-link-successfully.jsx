import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { login } from 'calypso/lib/paths';
import { useHeadingLogo } from 'calypso/login/wp-login/components/heading-logo';
import OneLoginFooter from 'calypso/login/wp-login/components/one-login-footer';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import { withEnhancers } from 'calypso/state/utils';
import { getConnectionFlowFromRedirectTo } from '../connection-flow';
import { LoginContext } from '../login-context';
import {
	MagicLoginEmailButton,
	MagicLoginEmailWrapper,
} from './magic-login-email/magic-login-email-wrapper';

// Product logins with a logo above the title (WooCommerce, Studio, Akismet...) keep their
// own centered layout; the rest follow the account template.
function CheckYourEmailActions( {
	emailAddress,
	isUnifiedConnectionFlow,
	connectorPlugins,
	renderHelpText,
} ) {
	const headingLogo = useHeadingLogo( { isUnifiedConnectionFlow, connectorPlugins } );

	if ( headingLogo ) {
		return (
			<>
				<Card className="magic-login__form">
					<div className="magic-login__emails-list">
						<MagicLoginEmailWrapper emailAddress={ emailAddress } />
					</div>
				</Card>
				<OneLoginFooter>
					<p className="one-login__footer-text">{ renderHelpText( 'one-login__footer-link' ) }</p>
				</OneLoginFooter>
			</>
		);
	}

	return (
		<div className="magic-login__check-email-actions">
			<MagicLoginEmailButton emailAddress={ emailAddress } />
			<p className="magic-login__check-email-help">{ renderHelpText() }</p>
		</div>
	);
}

class EmailedLoginLinkSuccessfully extends Component {
	static propTypes = {
		locale: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
		emailAddress: PropTypes.string,
		isWCCOM: PropTypes.bool,
		oauth2Client: PropTypes.object,
		redirectTo: PropTypes.string,
		currentQuery: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static contextType = LoginContext;

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );
	}

	onLostPasswordClick = ( event ) => {
		event.preventDefault();
		// This was tracked with `calypso_magic_login_lost_password_click`, check that event for older analytics
		recordTracksEvent( 'calypso_login_lost_password_click', {
			from: 'magic-login',
		} );
		page(
			login( {
				redirectTo: this.props.redirectTo,
				locale: this.props.locale,
				action: 'lostpassword', // TODO add jetpack/lostpassword
				oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
				from: this.props.currentQuery?.from,
			} )
		);
	};

	renderHelpText( className ) {
		return this.props.translate(
			"Didn't get the email? You might want to double check if the email address is associated with your account, {{a}}or reset your password.{{/a}}",
			{
				components: {
					a: (
						<a
							className={ className }
							href="/"
							onClick={ this.onLostPasswordClick }
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);
	}

	render() {
		const { emailAddress, redirectTo, currentQuery } = this.props;
		const { isUnifiedConnectionFlow, connectorPlugins } = getConnectionFlowFromRedirectTo(
			redirectTo,
			currentQuery
		);

		return (
			<>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation
					waitForEmailAddress={ emailAddress }
				/>

				<CheckYourEmailActions
					emailAddress={ emailAddress }
					isUnifiedConnectionFlow={ isUnifiedConnectionFlow }
					connectorPlugins={ connectorPlugins }
					renderHelpText={ ( className ) => this.renderHelpText( className ) }
				/>
			</>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	isWCCOM: getIsWCCOM( state ),
	currentQuery: getCurrentQueryArguments( state ),
	redirectTo: getRedirectToOriginal( state ),
	oauth2Client: getCurrentOAuth2Client( state ),
} );

const mapDispatch = {
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
