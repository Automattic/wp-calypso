import { CompactCard, MaterialIcon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import {
	getNumberOfMailboxesText,
	resolveEmailPlanStatus,
} from 'calypso/my-sites/email/email-management/home/utils';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type EmailListActiveWarningProps = {
	domain: ResponseDomain;
};

const EmailListActiveWarning = ( { domain }: EmailListActiveWarningProps ) => {
	const selectedSite = useSelector( getSelectedSite );

	const { data: emailAccounts = [], isLoading } = useGetEmailAccountsQuery(
		selectedSite?.ID ?? 0,
		domain.name,
		{ retry: false }
	);

	const { icon, statusClass, text } = resolveEmailPlanStatus(
		domain,
		emailAccounts[ 0 ],
		isLoading
	);

	if ( statusClass !== 'error' ) {
		return null;
	}

	return (
		<div className={ clsx( 'email-list-active__warning', statusClass ) }>
			<MaterialIcon icon={ icon } />

			<span>{ text }</span>
		</div>
	);
};

type EmailListActiveItemProps = {
	domain: ResponseDomain;
	source?: string;
};

const EmailListActiveItem = ( { domain, source = '' }: EmailListActiveItemProps ) => {
	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );

	return (
		<CompactCard
			href={ getEmailManagementPath( selectedSite?.slug, domain.name, currentRoute, { source } ) }
		>
			<span className="email-list-active__item-icon">
				<EmailTypeIcon domain={ domain } />
			</span>

			<div className="email-list-active__item-domain">
				<h2>{ domain.name }</h2>

				<span>{ getNumberOfMailboxesText( domain ) }</span>
			</div>

			<EmailListActiveWarning domain={ domain } />
		</CompactCard>
	);
};

type EmailListActiveProps = {
	domains: ResponseDomain[];
	source?: string;
};

const EmailListActive = ( { domains, source }: EmailListActiveProps ) => {
	const translate = useTranslate();

	if ( domains.length < 1 ) {
		return null;
	}

	return (
		<div className="email-list-active">
			<SectionHeader label={ translate( 'Domains with emails' ) } />

			{ domains.map( ( domain ) => (
				<EmailListActiveItem domain={ domain } key={ domain.name } source={ source } />
			) ) }
		</div>
	);
};

export default EmailListActive;
