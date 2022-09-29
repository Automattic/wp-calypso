import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactNode } from 'react';

type EmailListInactiveProps = {
	currentRoute: string;
	domains: ResponseDomain[];
	headerComponent: ReactNode;
	sectionHeaderLabel?: ReactNode;
	selectedSiteSlug: string;
	source: string;
};

const EmailListInactive = ( props: EmailListInactiveProps ) => {
	const { currentRoute, domains, headerComponent, sectionHeaderLabel, selectedSiteSlug, source } =
		props;

	const translate = useTranslate();

	if ( domains.length < 1 ) {
		return null;
	}

	const emailListItems = domains.map( ( domain ) => {
		return (
			<CompactCard className="email-list-inactive__mailbox" key={ domain.name }>
				<span>{ domain.name }</span>
				<Button
					href={ emailManagementPurchaseNewEmailAccount(
						selectedSiteSlug,
						domain.name,
						currentRoute,
						source
					) }
				>
					{ translate( 'Add Email' ) }
				</Button>
			</CompactCard>
		);
	} );

	return (
		<div className="email-list-inactive">
			{ headerComponent }
			<SectionHeader label={ sectionHeaderLabel ?? translate( 'Other domains' ) } />
			{ emailListItems }
		</div>
	);
};

export default EmailListInactive;
