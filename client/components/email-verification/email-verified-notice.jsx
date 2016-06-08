/**
 * External dependencies
 */
import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import page from 'page';

/**
 * Internal dependencies
 */

import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Emojify from 'components/emojify';
import i18n from 'i18n-calypso';
import emailVerification from './';
import _sites from 'lib/sites-list';

const sites = _sites();

export default class EmailVerifiedNotice extends React.Component {
	constructor( props ) {
		super( props );

		this.handleNextSteps = this.handleNextSteps.bind( this );
	}

	handleNextSteps() {
		page( '/me/next' );
	}

	render() {
		if ( !emailVerification.showVerifiedNotice ) {
			return null;
		}

		if ( isEmpty( sites.get() ) ) {
			return (
				<Notice status="is-success" text={ i18n.translate( "You've successfully confirmed your email address." ) } showDismiss={ false } className="email-verified-notice" />
			);
		}

		let noticeText = i18n.getLocaleSlug() === 'en'
				? i18n.translate( '{{strong}}Email confirmed, booyah 🎉✨{{/strong}} You may now add content to your site.', { components: { strong: <strong/> } } )
				: i18n.translate( "Email confirmed! Now that you've confirmed your email address you can publish posts on your blog." );

		return (
			<Notice status="is-success" text={ <Emojify>{ noticeText }</Emojify> } showDismiss={ false } className="email-verified-notice">
				<NoticeAction onClick={ this.handleNextSteps } icon="list-checkmark"><strong>{ i18n.translate( 'Next Steps' ) }</strong></NoticeAction>
			</Notice>
		);
	}
}
