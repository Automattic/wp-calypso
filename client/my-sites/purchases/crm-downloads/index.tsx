import { useTranslate } from 'i18n-calypso';
import {
	CrmDownloadsContent,
	CrmDownloadsError,
} from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { useSiteQuery } from 'calypso/data/sites/use-site-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

export function CrmDownloads( { purchaseId, siteSlug }: { purchaseId: number; siteSlug: string } ) {
	const translate = useTranslate();

	const { data, isError, isLoading } = useSiteQuery( siteSlug );

	return (
		<Main className="crm-downloads" wideLayout>
			<PageViewTracker path="/purchases/:site/crm-downloads/:purchaseId" title="CRM Downloads" />
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<HeaderCake backHref={ `/purchases/subscriptions/${ siteSlug }/${ purchaseId }` }>
				{ translate( 'CRM Downloads' ) }
			</HeaderCake>

			{ isError ? (
				<CrmDownloadsError onReturnClick={ () => ( window.location.href = '/me/purchases' ) } />
			) : (
				<CrmDownloadsContent isLoading={ isLoading } licenseKey={ data?.plan?.license_key || '' } />
			) }
		</Main>
	);
}

export default CrmDownloads;
