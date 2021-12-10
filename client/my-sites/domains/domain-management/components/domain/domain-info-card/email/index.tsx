import { useTranslate } from 'i18n-calypso';
import { useEmailAccountsQuery } from 'calypso/data/emails/use-emails-query';
import { getEmailAddress } from 'calypso/lib/emails';
import { emailManagement } from 'calypso/my-sites/email/paths';
import DomainInfoCard from '..';
import { DomainInfoCardProps } from '../types';
import { EmailAccount } from './types';

const DomainEmailInfoCard = ( { domain, selectedSite }: DomainInfoCardProps ): JSX.Element => {
	const translate = useTranslate();
	let emailAddresses: string[] = [];

	const { data, error, isLoading } = useEmailAccountsQuery( selectedSite.ID, domain.name );

	if ( ! isLoading && ! error ) {
		const emailAccounts: EmailAccount[] = data?.accounts;

		if ( emailAccounts.length ) {
			emailAddresses = emailAccounts
				.map( ( a ) => a.emails )
				.flat()
				.map( getEmailAddress )
				.filter( ( email ) => email );
		}
	}

	return ! emailAddresses.length ? (
		<DomainInfoCard
			type="href"
			href={ emailManagement( selectedSite.slug, domain.name ) }
			title={ translate( 'Email' ) }
			description={ translate( 'Send and receive emails from youremail@%(domainName)s', {
				args: { domainName: domain.name },
			} ) }
			ctaText={ translate( 'Add professional email' ) }
			isPrimary={ true }
		/>
	) : (
		<DomainInfoCard
			type="href"
			href={ emailManagement( selectedSite.slug, domain.name ) }
			title={ translate( 'Email' ) }
			description={ emailAddresses.join( '\n' ) }
			ctaText={ translate( 'View emails' ) }
		/>
	);
};

export default DomainEmailInfoCard;
