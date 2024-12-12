import { Badge, CompactCard, Gridicon, MaterialIcon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLink from 'calypso/components/external-link';
import SectionHeader from 'calypso/components/section-header';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import {
	getEmailAddress,
	getEmailForwardAddress,
	isEmailForward,
	isEmailForwardAccount,
	isEmailUserAdmin,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import { getGSuiteSubscriptionStatus, getGmailUrl } from 'calypso/lib/gsuite';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import EmailMailboxActionMenu from 'calypso/my-sites/email/email-management/home/email-mailbox-action-menu';
import EmailMailboxWarnings from 'calypso/my-sites/email/email-management/home/email-mailbox-warnings';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import { recordEmailAppLaunchEvent } from './utils';

const getListHeaderTextForAccountType = ( accountType, translate ) => {
	if ( accountType === EMAIL_ACCOUNT_TYPE_FORWARD ) {
		return translate( 'Email forwards', {
			comment:
				'This is a header for a list of email addresses that forward all emails to another email account',
		} );
	}
	return translate( 'Mailboxes', {
		comment: 'This is a header for a list of email addresses the user owns',
	} );
};

const MailboxListHeader = ( {
	accountType = null,
	children,
	isPlaceholder = false,
	addMailboxPath,
	domain,
	showIcon,
} ) => {
	const translate = useTranslate();

	const HeaderIcon = () => (
		<div className="email-plan-mailboxes-list__mailbox-header-icon">
			<EmailTypeIcon domain={ domain } />
		</div>
	);

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader
				isPlaceholder={ isPlaceholder }
				label={
					<>
						{ !! showIcon && domain && <HeaderIcon /> }
						{ getListHeaderTextForAccountType( accountType, translate ) }
					</>
				}
			>
				{ addMailboxPath && (
					<Button isLink="link" href={ addMailboxPath }>
						{ translate( 'Add mailbox' ) }
					</Button>
				) }
			</SectionHeader>
			{ children }
		</div>
	);
};

const MailboxListItem = ( { children, isError = false, isPlaceholder, hasNoEmails } ) => {
	const className = clsx( 'email-plan-mailboxes-list__mailbox-list-item', {
		'is-placeholder': isPlaceholder,
		'no-emails': hasNoEmails,
	} );
	return (
		<CompactCard className={ className } highlight={ isError ? 'error' : null }>
			{ children }
		</CompactCard>
	);
};

function EmailForwardSecondaryDetails( { mailbox } ) {
	if ( isEmailForward( mailbox ) ) {
		return (
			<div className="email-plan-mailboxes-list__mailbox-secondary-details">
				<Gridicon icon="chevron-right" />
				<span>{ getEmailForwardAddress( mailbox ) }</span>
			</div>
		);
	}
	return null;
}

function MailboxLink( { account, mailbox } ) {
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();
	const emailAddress = getEmailAddress( mailbox );

	if ( isEmailForwardAccount( account ) ) {
		return (
			<div className="email-plan-mailboxes-list__mailbox-list-link">
				<span>{ emailAddress }</span>
			</div>
		);
	}

	const isTitan = isTitanMailAccount( account );
	const primaryHref = isTitan
		? getTitanEmailUrl( titanAppsUrlPrefix, emailAddress, false, window.location.href )
		: getGmailUrl( emailAddress );

	return (
		<ExternalLink
			className="email-plan-mailboxes-list__mailbox-list-link"
			href={ primaryHref }
			onClick={ () => {
				recordEmailAppLaunchEvent( {
					app: isTitan ? titanAppsUrlPrefix : 'webmail',
					context: 'email-management-list',
					provider: isTitan ? 'titan' : 'google',
				} );
			} }
			target="_blank"
			rel="noopener noreferrer"
		>
			<span>{ emailAddress }</span>
			<Gridicon icon="external" size={ 18 } />
		</ExternalLink>
	);
}

function EmailPlanMailboxesList( { account, domain, isLoadingEmails, mailboxes, addMailboxPath } ) {
	const translate = useTranslate();
	const accountType = account?.account_type;

	if ( isLoadingEmails ) {
		return (
			<MailboxListHeader isPlaceholder accountType={ accountType } domain={ domain }>
				<MailboxListItem isPlaceholder>
					<MaterialIcon icon="email" />
					<span />
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	if ( ! mailboxes || mailboxes.length < 1 ) {
		let missingMailboxesText = translate( 'No mailboxes' );

		if (
			isRecentlyRegistered( domain.registrationDate, 45 ) &&
			getGSuiteSubscriptionStatus( domain ) === 'unknown'
		) {
			missingMailboxesText = translate(
				'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
			);
		}

		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>{ missingMailboxesText }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const mailboxItems = mailboxes.map( ( mailbox ) => {
		const mailboxHasWarnings = Boolean( mailbox?.warnings?.length );

		return (
			<MailboxListItem key={ mailbox.mailbox } isError={ mailboxHasWarnings }>
				<div className="email-plan-mailboxes-list__mailbox-list-item-main">
					<MailboxLink account={ account } mailbox={ mailbox } />
					<EmailForwardSecondaryDetails mailbox={ mailbox } />
				</div>

				{ isEmailUserAdmin( mailbox ) && (
					<Badge type="info">
						{ translate( 'Admin', {
							comment: 'Email user role displayed as a badge',
						} ) }
					</Badge>
				) }

				<EmailMailboxWarnings account={ account } mailbox={ mailbox } />

				{ ! mailbox.temporary && (
					<EmailMailboxActionMenu account={ account } domain={ domain } mailbox={ mailbox } />
				) }
			</MailboxListItem>
		);
	} );

	return (
		<MailboxListHeader
			accountType={ accountType }
			addMailboxPath={ addMailboxPath }
			showIcon={ !! addMailboxPath }
			domain={ domain }
		>
			{ mailboxItems }
		</MailboxListHeader>
	);
}

EmailPlanMailboxesList.propTypes = {
	account: PropTypes.object,
	domain: PropTypes.object,
	isLoadingEmails: PropTypes.bool,
	mailboxes: PropTypes.array,
	addMailboxPath: PropTypes.string,
};

export default EmailPlanMailboxesList;
