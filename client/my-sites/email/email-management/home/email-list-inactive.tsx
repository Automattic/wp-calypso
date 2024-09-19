import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import { getPurchaseNewEmailAccountPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

type EmailListInactiveItemProps = {
	domain: ResponseDomain;
	source?: string;
};

const EmailListInactiveItem = ( { domain, source }: EmailListInactiveItemProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );

	return (
		<CompactCard className="email-list-inactive__mailbox">
			<span>{ domain.name }</span>

			<Button
				href={ getPurchaseNewEmailAccountPath(
					selectedSite?.slug,
					domain.name,
					currentRoute,
					source
				) }
			>
				{ translate( 'Add Email' ) }
			</Button>
		</CompactCard>
	);
};

type EmailListInactiveProps = {
	domains: ResponseDomain[];
	headerComponent?: ReactNode;
	sectionHeaderLabel?: TranslateResult;
	source?: string;
};

const EmailListInactive = ( {
	domains,
	headerComponent,
	sectionHeaderLabel,
	source,
}: EmailListInactiveProps ) => {
	const translate = useTranslate();

	if ( domains.length < 1 ) {
		return null;
	}

	return (
		<div className="email-list-inactive">
			{ headerComponent }

			<SectionHeader label={ sectionHeaderLabel ?? translate( 'Other domains' ) } />

			{ domains.map( ( domain ) => (
				<EmailListInactiveItem domain={ domain } key={ domain.name } source={ source } />
			) ) }
		</div>
	);
};

export default EmailListInactive;
