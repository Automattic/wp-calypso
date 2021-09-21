import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { useGetMailboxes } from 'calypso/data/emails/use-get-mailboxes';
import {
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from 'calypso/lib/emails/email-provider-constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const MailboxItemIcon = ( { mailbox } ) => {
	const translate = useTranslate();

	if (
		[ EMAIL_ACCOUNT_TYPE_TITAN_MAIL, EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL ].includes(
			mailbox?.account_type ?? null
		)
	) {
		return (
			<span className="mailbox-selection-list__icon-circle"> { mailbox.mailbox[ 0 ] ?? 'T' } </span>
		);
	}

	return <img src={ googleWorkspaceIcon } alt={ translate( 'Google Workspace icon' ) } />;
};

const MailBoxItem = ( { mailbox } ) => {
	return (
		<Card className="mailbox-selection-list__item" href="https://www.google.com" target="external">
			<span className="mailbox-selection-list__icon">
				<MailboxItemIcon mailbox={ mailbox } />
			</span>
			<div className="mailbox-selection-list__domain">
				<h2>
					{ mailbox.mailbox }@{ mailbox.domain }
				</h2>
			</div>
		</Card>
	);
};

const MailboxSelectionList = () => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const { data, error, isLoading } = useGetMailboxes( selectedSite?.ID ?? null, {
		retry: false,
	} );

	if ( isLoading || error ) {
		return null;
	}

	return (
		<div className="mailbox-selection-list">
			<FormattedHeader
				align="center"
				brandFont
				className="mailbox-selection-list__header"
				headerText={ translate( 'Welcome to Inbox!' ) }
				subHeaderText={ translate( 'Choose the mailbox you’d like to open.' ) }
			/>

			{ ( data.mailboxes ?? [] ).map( ( mailbox, index ) => (
				<MailBoxItem mailbox={ mailbox } key={ index } />
			) ) }
		</div>
	);
};

export default MailboxSelectionList;
