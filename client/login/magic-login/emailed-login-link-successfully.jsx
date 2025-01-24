import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { withEnhancers } from 'calypso/state/utils';
import { MagicLoginEmailWrapper } from './magic-login-email/magic-login-email-wrapper';
class EmailedLoginLinkSuccessfully extends Component {
	static propTypes = {
		locale: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );
	}

	onLostPasswordClick = ( event ) => {
		recordTracksEvent( 'calypso_magic_login_lost_password_click' );

		if ( this.props.isWoo ) {
			event.preventDefault();

			page(
				login( {
					redirectTo: this.props.redirectTo,
					locale: this.props.locale,
					action: 'lostpassword',
					oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
					from: get( this.props.currentQuery, 'from' ),
				} )
			);
		}
	};

	render() {
		const { translate, emailAddress } = this.props;
		const successMessage = emailAddress
			? translate( "We've sent a login link to {{strong}}%(emailAddress)s{{/strong}}", {
					args: { emailAddress },
					components: { strong: <strong /> },
			  } )
			: translate( 'We just emailed you a link.' );

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation
					waitForEmailAddress={ emailAddress }
				/>

				<h1 className="magic-login__form-header">{ translate( 'Check your email' ) }</h1>

				<Card className="magic-login__form">
					<div className="magic-login__form-text">
						<p>{ preventWidows( successMessage ) }</p>
					</div>
				</Card>
				<div className="magic-login__emails-list">
					<MagicLoginEmailWrapper emailAddress={ emailAddress } />
				</div>

				<div className="magic-login__footer">
					<p>
						{ translate(
							"Didn't get the email? You might want to double check if the email address is associated with your account,{{a}}or reset your password.{{/a}}",
							{
								components: {
									a: (
										<a
											href={ lostPassword( { locale: this.props.locale } ) }
											onClick={ this.onLostPasswordClick }
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</div>
			</div>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	isWoo: isWooOAuth2Client( getCurrentOAuth2Client( state ) ),
	currentQuery: getCurrentQueryArguments( state ),
	redirectTo: getRedirectToOriginal( state ),
	oauth2Client: getCurrentOAuth2Client( state ),
} );

const mapDispatch = {
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
