/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { recordPageView } from 'state/analytics/actions';

class EmailedLoginLinkSuccessfully extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
	};

	render() {
		const { translate, emailAddress } = this.props;
		const line = [
			emailAddress
				? translate( 'We sent an email to %(emailAddress)s with a magic login link.', {
					args: {
						emailAddress
					}
				} )
				: translate( 'We sent you an email with a magic login link.' ),
			( <br key="magic-login-line-br" /> ),
			translate( 'It should arrive within a few minutes. Go click it!', {
				context: '"It" is an email'
			} )
		];

		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ emailAddress }
				/>
				<EmptyContent
					action={ translate( 'Back to WordPress.com' ) }
					actionURL={ '/' }
					illustration={ '/calypso/images/drake/drake-all-done.svg' }
					illustrationWidth={ 500 }
					line={ line }
					title={ translate( 'Check your Email!' ) }
					/>
			</div>
		);
	}
}

const mapDispatch = {
	recordPageView,
};

export default connect( null, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
