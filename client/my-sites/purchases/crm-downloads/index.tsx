import { useTranslate } from 'i18n-calypso';
import { CrmDownloadsContent } from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

export function CrmDownloads( { licenseKey }: { licenseKey: string } ) {
	const translate = useTranslate();

	return (
		<Main className="crm-downloads" wideLayout>
			<PageViewTracker path="/purchases/crm-downloads/:licenseKey" title="CRM Downloads" />
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<HeaderCake backHref="/purchases/subscriptions/">{ translate( 'CRM Downloads' ) }</HeaderCake>

			<CrmDownloadsContent licenseKey={ licenseKey } />
		</Main>
	);
}

export default CrmDownloads;
