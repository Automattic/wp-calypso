/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';

class EmailedLoginLinkSuccessfully extends React.Component {
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

export default localize( EmailedLoginLinkSuccessfully );
