import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { useGetMailboxes } from 'calypso/data/emails/use-get-mailboxes';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

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

			{ ( data.mailboxes ?? [] ).map( ( mailbox ) => (
				<CompactCard>
					{ mailbox.mailbox }@{ mailbox.domain }
				</CompactCard>
			) ) }
		</div>
	);
};

export default MailboxSelectionList;
