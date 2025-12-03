import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { login } from 'calypso/lib/paths';
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
import { LoginContext } from '../login-context';
import { MagicLoginEmailWrapper } from './magic-login-email/magic-login-email-wrapper';

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
				from: get( this.props.currentQuery, 'from' ),
			} )
		);
	};

	render() {
		const { translate, emailAddress } = this.props;

		return (
			<>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation
					waitForEmailAddress={ emailAddress }
				/>

				<Card className="magic-login__form">
					<div className="magic-login__emails-list">
						<MagicLoginEmailWrapper emailAddress={ emailAddress } />
					</div>
				</Card>
				<OneLoginFooter>
					<p className="one-login__footer-text">
						{ translate(
							"Didn't get the email? You might want to double check if the email address is associated with your account,{{a}}or reset your password.{{/a}}",
							{
								components: {
									a: (
										<a
											className="one-login__footer-link"
											href="/"
											onClick={ this.onLostPasswordClick }
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</OneLoginFooter>
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
