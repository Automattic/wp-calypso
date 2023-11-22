import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
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
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { withEnhancers } from 'calypso/state/utils';
import { MagicLoginEmailWrapper } from './magic-login-email/magic-login-email-wrapper';
class EmailedLoginLinkSuccessfully extends Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		locale: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );
	}

	onClickBackLink = ( event ) => {
		event.preventDefault();

		this.props.hideMagicLoginRequestForm();

		page(
			login( {
				isJetpack: this.props.isJetpackLogin,
				isWhiteLogin: this.props.isWhiteLogin,
				locale: this.props.locale,
			} )
		);
	};

	openEmail = ( url ) => {
		event.preventDefault();
		window.open( url, '_blank' );
	};

	render() {
		const { translate, emailAddress } = this.props;
		const line = [
			emailAddress
				? translate( "We've sent a login link to " )
				: translate( 'We just emailed you a link.' ),
		];

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ emailAddress }
				/>

				<h1 className="magic-login__form-header">{ translate( 'Check your email' ) }</h1>

				<Card className="magic-login__form">
					<div className="magic-login__form-text">
						<p>{ preventWidows( line ) }</p>
						<b>{ emailAddress }</b>
					</div>
				</Card>
				<div className="magic-login__emails-list">
					<MagicLoginEmailWrapper emailAddress={ emailAddress } />
				</div>

				<div className="magic-login__footer">
					<p>
						Didn't get the email? You might want to double check if the email address is associated
						with your account,
						<a
							href={ login( {
								isJetpack: this.props.isJetpackLogin,
								isWhiteLogin: this.props.isWhiteLogin,
								locale: this.props.locale,
							} ) }
							onClick={ this.onClickBackLink }
						>
							{ /* <Gridicon icon="arrow-left" size={ 18 } /> */ }
							{ translate( 'or login with a password instead.' ) }
						</a>
					</p>
				</div>
			</div>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
	isWhiteLogin: getCurrentRoute( state )?.startsWith( '/log-in/new/link' ),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
