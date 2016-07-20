/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class HelpUnverifiedWarning extends Component {
	constructor( props ) {
		super( props );
	}

	render() {
		return (
			<Notice
				status="is-warning"
				showDismiss={ false }
				text={ this.props.translate( "Trouble activating your account? Just click this button and we'll resend the activation for you." ) }>
				<NoticeAction href="#">
					{ this.props.translate( "Resend Email" ) }
				</NoticeAction>
			</Notice>
	    );
	}
}

export default localize( HelpUnverifiedWarning );
