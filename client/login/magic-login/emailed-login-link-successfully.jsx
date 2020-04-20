/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { login } from 'lib/paths';
import { Card } from '@automattic/components';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import Gridicon from 'components/gridicon';

/**
 * Image dependencies
 */
import checkEmailImage from 'assets/images/illustrations/check-email.svg';

class EmailedLoginLinkSuccessfully extends React.Component {
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
			login( { isNative: true, isJetpack: this.props.isJetpackLogin, locale: this.props.locale } )
		);
	};

	render() {
		const { translate, emailAddress } = this.props;
		const line = [
			emailAddress
				? translate( 'We just emailed a link to %(emailAddress)s.', {
						args: {
							emailAddress,
						},
				  } )
				: translate( 'We just emailed you a link.' ),
			' ',
			translate( 'Please check your inbox and click the link to log in.' ),
		];

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ emailAddress }
				/>

				<h1 className="magic-login__form-header">{ translate( 'Check your email!' ) }</h1>

				<Card className="magic-login__form">
					<img alt="" src={ checkEmailImage } className="magic-login__check-email-image" />
					<p>{ line }</p>
				</Card>

				<div className="magic-login__footer">
					<a
						href={ login( {
							isNative: true,
							isJetpack: this.props.isJetpackLogin,
							isGutenboarding: this.props.isGutenboardingLogin,
							locale: this.props.locale,
						} ) }
						onClick={ this.onClickBackLink }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Back' ) }
					</a>
				</div>
			</div>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
	isGutenboardingLogin: getCurrentRoute( state )?.startsWith( '/log-in/gutenboarding/link' ),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
