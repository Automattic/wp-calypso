import { EmailBox } from '@automattic/api-core';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	Button,
	FlexBlock,
	Notice,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect } from 'react';
import { useAuth } from '../../app/auth';
import { emailsRoute, mailboxesReadyRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import {
	buildGoogleFinishSetupLink,
	buildGoogleMailboxLink,
	buildTitanMailboxLink,
} from '../../utils/email-utils';

import './styles.scss';

const MailboxesReadyNotice = () => {
	const { mailboxAccount, status } = mailboxesReadyRoute.useLoaderData();
	const { user } = useAuth();

	if ( status === 'google_pending_tos_acceptance' ) {
		const accountWarning = mailboxAccount.warnings.find(
			( warning: { message: string; warning_slug: string } ) =>
				'google_pending_tos_acceptance' === warning.warning_slug
		);
		return (
			<Notice status="warning" isDismissible={ false }>
				{ accountWarning.message }
			</Notice>
		);
	} else if ( status === 'google_configuring' ) {
		return (
			<Notice status="info" isDismissible={ false }>
				{ createInterpolateElement(
					sprintf(
						// Translators: %(email)s is the email address of the user.
						__(
							"<strong>Keep an eye on your email to finish setting up your new email addresses.</strong> We are setting up your new Google Workspace users but this process can take several minutes. We will email you at %(email)s with login information once they are ready but if you still haven't received anything after a few hours, do not hesitate to <link>contact support</link>."
						),
						{
							email: user.email,
						}
					),
					{
						link: <a href={ CALYPSO_CONTACT } rel="noopener noreferrer" target="_blank" />,
						strong: <strong />,
					}
				) }
			</Notice>
		);
	}

	return null;
};

export default function MailboxesReady() {
	const { mailboxAccount, emails, status } = mailboxesReadyRoute.useLoaderData();
	const navigate = useNavigate();

	useEffect( () => {
		if ( ! mailboxAccount ) {
			navigate( { to: emailsRoute.to } );
		}
	}, [ mailboxAccount, navigate ] );

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
		[ mailboxAccount?.account_type ]
	);

	return (
		<PageLayout header={ <PageHeader /> } notices={ <MailboxesReadyNotice /> } size="small">
			{ status === 'ready' && (
				<Text size={ 16 }>
					{ _n(
						'You can now access, set up, and manage your new mailbox.',
						'You can now access, set up, and manage your new mailboxes.',
						emails.length
					) }
				</Text>
			) }
			{ emails.length && (
				<ItemGroup className="mailboxes-ready__item-group" isBordered isSeparated>
					{ emails.map( ( email: EmailBox ) => (
						<Item key={ email.mailbox }>
							<HStack>
								<FlexBlock>{ email.mailbox + '@' + email.domain }</FlexBlock>
								<Button
									__next40pxDefaultSize
									href={
										status === 'google_pending_tos_acceptance'
											? buildGoogleFinishSetupLink(
													email.mailbox + '@' + email.domain,
													email.domain
											  )
											: getMailboxUrl( email )
									}
									variant="link"
									target="_blank"
									disabled={ status === 'google_configuring' }
								>
									{ status === 'ready' ? __( 'View mailbox ↗' ) : __( 'Finish setup ↗' ) }
								</Button>
							</HStack>
						</Item>
					) ) }
				</ItemGroup>
			) }
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
