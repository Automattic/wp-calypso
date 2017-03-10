/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { getCurrentQueryArguments } from 'state/ui/selectors';

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
			<EmptyContent
				title={ translate( 'Check your Email!' ) }
				line={ line }
				action={ translate( 'Back to WordPress.com' ) }
				actionURL={ '/' }
				illustration={ '/calypso/images/drake/drake-all-done.svg' }
				illustrationWidth={ 500 }
				/>
		);
	}
}

const mapState = state => {
	const queryArguments = getCurrentQueryArguments( state );
	const { email } = queryArguments;

	return {
		emailAddress: emailValidator.validate( email ) ? email : null,
	};
};

export default connect( mapState )( localize( EmailedLoginLinkSuccessfully ) );
