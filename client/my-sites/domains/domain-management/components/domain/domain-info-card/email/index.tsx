import { Count } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCurrentRoute } from 'calypso/components/route';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { type as domainType } from 'calypso/lib/domains/constants';
import { getEmailAddress } from 'calypso/lib/emails';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import DomainInfoCard from '..';
import type { DomainInfoCardProps } from '../types';

const DomainEmailInfoCard = ( { domain, selectedSite }: DomainInfoCardProps ) => {
	const translate = useTranslate();
	const typesUnableToAddEmail = [ domainType.TRANSFER, domainType.SITE_REDIRECT ] as const;
	const { data: emailAccounts = [], error } = useGetEmailAccountsQuery(
		selectedSite.ID,
		domain.name
	);
	const { currentRoute } = useCurrentRoute();

	let emailAddresses: string[] = [];

	if (
		! canCurrentUserAddEmail( domain ) ||
		typesUnableToAddEmail.includes( domain.type ) ||
		domain.pendingRegistrationAtRegistry
	) {
		return null;
	}

	if ( ! error && emailAccounts.length ) {
		emailAddresses = emailAccounts
			.map( ( a ) => a.emails )
			.flat()
			.map( getEmailAddress )
			.filter( ( email ) => email );
	}

	return ! emailAddresses.length ? (
		<DomainInfoCard
			type="href"
			href={ getEmailManagementPath( selectedSite.slug, domain.name, currentRoute ) }
			title={ translate( 'Email' ) }
			description={ translate( 'Send and receive emails from youremail@%(domainName)s', {
				args: { domainName: domain.name },
			} ) }
			ctaText={ translate( 'Add professional email' ) }
			isPrimary
			buttonDisabled={ domain.isMoveToNewSitePending }
		/>
	) : (
		<DomainInfoCard
			type="href"
			href={ getEmailManagementPath( selectedSite.slug, domain.name, currentRoute ) }
			title={
				<>
					{ translate( 'Email' ) }
					<Count count={ emailAddresses.length }></Count>
				</>
			}
			description={ emailAddresses.join( '\n' ) }
			ctaText={ translate( 'View emails' ) }
			buttonDisabled={ domain.isMoveToNewSitePending }
		/>
	);
};

export default DomainEmailInfoCard;
