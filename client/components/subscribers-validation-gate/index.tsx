import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import StagingGate from 'calypso/components/staging-gate';
import { useSelector } from 'calypso/state';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import type { SiteId } from 'calypso/types';

interface Props {
	siteId: SiteId | null;
	children: ReactNode;
}

const SubscriberValidationGate: FC< Props > = ( { children, siteId } ) => {
	const translate = useTranslate();
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	return isStagingSite ? (
		<StagingGate siteId={ siteId }>{ children }</StagingGate>
	) : (
		<EmailVerificationGate
			noticeText={ translate( 'You must verify your email to add subscribers.' ) }
			noticeStatus="is-warning"
		>
			{ children }
		</EmailVerificationGate>
	);
};

export default SubscriberValidationGate;
