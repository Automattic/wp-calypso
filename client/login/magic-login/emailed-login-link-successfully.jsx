/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { login } from 'lib/paths';
import { recordPageView } from 'state/analytics/actions';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';

class EmailedLoginLinkSuccessfully extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
	};

	onClickBackLink = event => {
		event.preventDefault();
		this.props.hideMagicLoginRequestForm();
		page( login( { isNative: true } ) );
	};

	render() {
		const { translate, emailAddress } = this.props;
		const line = [
			emailAddress
				? translate( 'We just emailed a link to %(emailAddress)s.', {
					args: {
						emailAddress
					}
				} )
				: translate( 'We just emailed you a link.' ),
			( ' ' ),
			translate( 'Please check your inbox and click the link to log in.' )
		];

		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ emailAddress }
				/>
				<h1 className="magic-login__form-header">
					{ translate( 'Check your email!' ) }
				</h1>
				<Card className="magic-login__form">
					<img
						src="/calypso/images/login/check-email.svg"
						className="magic-login__check-email-image" />
					<p>
						{ line }
					</p>
				</Card>
				<div className="magic-login__footer">
					<a href="#" onClick={ this.onClickBackLink }>
						<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Back' ) }
					</a>
				</div>
			</div>
		);
	}
}

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView,
};

export default connect( null, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
