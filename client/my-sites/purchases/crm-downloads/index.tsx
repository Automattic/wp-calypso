import { useTranslate } from 'i18n-calypso';
import {
	CrmDownloadsError,
	CrmDownloadsContent,
} from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import useUserLicenseBySubscriptionQuery from 'calypso/data/jetpack-licensing/use-user-license-by-subscription-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

export function CrmDownloads( { subscription }: { subscription: number } ) {
	const translate = useTranslate();
	const { data, isError, isLoading } = useUserLicenseBySubscriptionQuery( subscription );

	return (
		<Main className="crm-downloads" wideLayout>
			<PageViewTracker path="/purchases/crm-downloads/:licenseKey" title="CRM Downloads" />
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<HeaderCake backHref="/purchases/subscriptions/">{ translate( 'CRM Downloads' ) }</HeaderCake>

			{ isError ? (
				<CrmDownloadsError />
			) : (
				<CrmDownloadsContent licenseKey={ data?.licenseKey } isLoading={ isLoading } />
			) }
		</Main>
	);
}

export default CrmDownloads;
