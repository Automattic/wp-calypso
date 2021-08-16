/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getConfiguredTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

const TitanUnusedMailboxesNotice = ( { domain, maxTitanMailboxCount, onFinishSetupClick } ) => {
	const translate = useTranslate();

	if ( ! hasTitanMailWithUs( domain ) ) {
		return null;
	}

	const numberOfUnusedMailboxes = maxTitanMailboxCount - getConfiguredTitanMailboxCount( domain );

	if ( numberOfUnusedMailboxes <= 0 ) {
		return null;
	}

	const text = translate(
		'You have %(numberOfMailboxes)d unused mailbox. Do you want to set it up now instead of purchasing new ones?',
		'You have %(numberOfMailboxes)d unused mailboxes. Do you want to set one of them up now instead of purchasing new ones?',
		{
			count: numberOfUnusedMailboxes,
			args: {
				numberOfMailboxes: numberOfUnusedMailboxes,
			},
			comment: 'This refers to the number of mailboxes purchased that have not been set up yet',
		}
	);

	const ctaText = translate( 'Set up mailbox' );

	return (
		<Notice icon="notice" showDismiss={ false } status="is-warning" text={ text }>
			<NoticeAction onClick={ onFinishSetupClick }>{ ctaText }</NoticeAction>
		</Notice>
	);
};

TitanUnusedMailboxesNotice.propTypes = {
	domain: PropTypes.object.isRequired,
	maxTitanMailboxCount: PropTypes.number.isRequired,
	onFinishSetupClick: PropTypes.func.isRequired,
};

export default TitanUnusedMailboxesNotice;
