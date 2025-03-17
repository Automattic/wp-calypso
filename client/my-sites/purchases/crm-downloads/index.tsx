import { useTranslate } from 'i18n-calypso';
import {
	CrmDownloadsContent,
	CrmDownloadsError,
} from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import useUserLicenseBySubscriptionQuery from 'calypso/data/jetpack-licensing/use-user-license-by-subscription-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

export function CrmDownloads( { purchaseId }: { purchaseId: number; siteSlug: string } ) {
	const translate = useTranslate();

	// Fetch the license key using the purchase ID
	const { data, isError } = useUserLicenseBySubscriptionQuery( purchaseId );
	const licenseKey = data?.licenseKey || '';

	return (
		<Main className="crm-downloads" wideLayout>
			<PageViewTracker path="/me/purchases/:site/crm-downloads/:purchaseId" title="CRM Downloads" />
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<NavigationHeader title={ translate( 'CRM Downloads' ) } />

			{ isError ? (
				<CrmDownloadsError onReturnClick={ () => ( window.location.href = '/me/purchases' ) } />
			) : (
				<CrmDownloadsContent licenseKey={ licenseKey } />
			) }
		</Main>
	);
}

export default CrmDownloads;
