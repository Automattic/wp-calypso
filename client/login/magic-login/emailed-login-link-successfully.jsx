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
import { login } from 'calypso/lib/paths';
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
		this.context?.setHeaders( {
			heading: this.props.translate( 'Check your email' ),
			subHeading: this.getSubHeaderText(),
		} );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.emailAddress !== this.props.emailAddress ) {
			this.context?.setHeaders( {
				heading: this.context?.heading,
				subHeading: this.getSubHeaderText(),
			} );
		}
	}

	getSubHeaderText() {
		return preventWidows(
			this.props.emailAddress
				? this.props.translate(
						"We've sent a login link to {{strong}}%(emailAddress)s{{/strong}}",
						{
							args: { emailAddress: this.props.emailAddress },
							components: { strong: <strong /> },
						}
				  )
				: this.props.translate( 'We just emailed you a link.' )
		);
	}

	onLostPasswordClick = ( event ) => {
		event.preventDefault();
		recordTracksEvent( 'calypso_magic_login_lost_password_click' );
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
			<div className="magic-login__form">
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
				<div className="magic-login__footer">
					<p>
						{ translate(
							"Didn't get the email? You might want to double check if the email address is associated with your account,{{a}}or reset your password.{{/a}}",
							{
								components: {
									a: <a href="/" onClick={ this.onLostPasswordClick } rel="noopener noreferrer" />,
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
	isWCCOM: getIsWCCOM( state ),
	currentQuery: getCurrentQueryArguments( state ),
	redirectTo: getRedirectToOriginal( state ),
	oauth2Client: getCurrentOAuth2Client( state ),
} );

const mapDispatch = {
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
