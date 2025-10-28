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
import { useCallback } from 'react';
import { useAuth } from '../../app/auth';
import { emailsRoute, mailboxesReadyRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import {
	accountHasWarningWithSlug,
	buildGoogleFinishSetupLink,
	buildGoogleMailboxLink,
	buildTitanMailboxLink,
} from '../../utils/email-utils';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';

import './styles.scss';

export default function MailboxesReady() {
	const { domain } = useDomainFromUrlParam();
	const { mailboxAccount, emails } = mailboxesReadyRoute.useLoaderData();
	const navigate = useNavigate();
	const { user } = useAuth();

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

	let isGooglePendingTosAcceptance = false;
	let isGoogleConfiguring = false;
	let notice = null;
	if (
		mailboxAccount &&
		accountHasWarningWithSlug( 'google_pending_tos_acceptance', mailboxAccount )
	) {
		isGooglePendingTosAcceptance = true;
		const accountWarning = mailboxAccount.warnings.find(
			( warning: { message: string; warning_slug: string } ) =>
				'google_pending_tos_acceptance' === warning.warning_slug
		);
		notice = {
			message: accountWarning.message,
			status: 'warning',
		};
	} else if (
		mailboxAccount?.account_type === 'google_workspace' &&
		domain.google_apps_subscription?.status === 'unknown'
	) {
		isGoogleConfiguring = true;
		notice = {
			message: createInterpolateElement(
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
			),
			status: 'info',
		};
	}

	return (
		<PageLayout
			header={ <PageHeader /> }
			notices={
				notice !== null && (
					// @ts-expect-error -- status is either warning or info.
					<Notice status={ notice.status } isDismissible={ false }>
						{ notice.message }
					</Notice>
				)
			}
			size="small"
		>
			{ notice === null && (
				<Text size={ 16 }>
					{ _n(
						'You can now access, set up, and manage your new mailbox.',
						'You can now access, set up, and manage your new mailboxes.',
						emails.length
					) }
				</Text>
			) }
			<ItemGroup className="mailboxes-ready__item-group" isBordered isSeparated>
				{ emails.map( ( email: EmailBox ) => (
					<Item key={ email.mailbox }>
						<HStack>
							<FlexBlock>{ email.mailbox + '@' + email.domain }</FlexBlock>
							<Button
								__next40pxDefaultSize
								href={
									isGooglePendingTosAcceptance
										? buildGoogleFinishSetupLink( email.mailbox + '@' + email.domain, email.domain )
										: getMailboxUrl( email )
								}
								variant="link"
								target="_blank"
								disabled={ isGoogleConfiguring }
							>
								{ isGooglePendingTosAcceptance ? __( 'Finish setup ↗' ) : __( 'View mailbox ↗' ) }
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
