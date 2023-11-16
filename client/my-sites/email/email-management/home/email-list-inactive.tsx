import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { useOdieAssistantContext } from 'calypso/odie/context';
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
	const { sendNudge } = useOdieAssistantContext();
	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );

	return (
		<CompactCard className="email-list-inactive__mailbox">
			<span>{ domain.name }</span>

			<Button
				href={ emailManagementPurchaseNewEmailAccount(
					selectedSite?.slug ?? '',
					domain.name,
					currentRoute,
					source
				) }
				onClick={ () => {
					sendNudge( {
						nudge: 'email-comparison',
						initialMessage: `I see you want to add an email provider to your domain ${ domain.name }. I can give you a few tips on how to do that.`,
						context: {
							domain: domain.name,
						},
					} );
				} }
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
