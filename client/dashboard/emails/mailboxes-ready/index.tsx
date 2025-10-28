import { EmailBox } from '@automattic/api-core';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	Button,
	FlexBlock,
} from '@wordpress/components';
import { __, _n } from '@wordpress/i18n';
import { useCallback } from 'react';
import { emailsRoute, mailboxesReadyRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { buildGoogleMailboxLink, buildTitanMailboxLink } from '../../utils/email-utils';

import './styles.scss';

export default function MailboxesReady() {
	const { mailboxAccount, emails } = mailboxesReadyRoute.useLoaderData();
	const navigate = useNavigate();

	const getMailboxUrl = useCallback(
		( email: EmailBox ) => {
			const emailAddress = email.mailbox + '@' + email.domain;
			if ( mailboxAccount.account_type === 'titan' ) {
				return buildTitanMailboxLink( emailAddress );
			}

			if ( mailboxAccount.account_type === 'google_workspace' ) {
				return buildGoogleMailboxLink( emailAddress, email.domain );
			}
		},
		[ mailboxAccount.account_type ]
	);

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Text size={ 16 }>
				{ _n(
					'You can now access, set up, and manage your new mailbox.',
					'You can now access, set up, and manage your new mailboxes.',
					emails.length
				) }
			</Text>
			<ItemGroup className="mailboxes-ready__item-group" isBordered isSeparated>
				{ emails.map( ( email: EmailBox ) => (
					<Item key={ email.mailbox }>
						<HStack>
							<FlexBlock>{ email.mailbox + '@' + email.domain }</FlexBlock>
							<Button
								__next40pxDefaultSize
								href={ getMailboxUrl( email ) }
								variant="link"
								target="_blank"
							>
								{ __( 'View mailbox ↗' ) }
							</Button>
						</HStack>
					</Item>
				) ) }
			</ItemGroup>
			<Button
				__next40pxDefaultSize
				variant="primary"
				onClick={ () => {
					navigate( {
						to: emailsRoute.to,
					} );
				} }
				className="mailboxes-ready__back-button"
			>
				{ __( 'Back to Emails' ) }
			</Button>
		</PageLayout>
	);
}
