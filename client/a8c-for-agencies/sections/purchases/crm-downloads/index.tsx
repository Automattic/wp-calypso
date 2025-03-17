import { useTranslate } from 'i18n-calypso';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { CrmDownloadsContent } from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';

export function CrmDownloads( { licenseKey }: { licenseKey: string } ) {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<PageViewTracker
				title="Purchases > CRM Downloads"
				path="/purchases/crm-downloads/:site/:licenseKey"
			/>

			<Layout className="crm-downloads" title={ translate( 'CRM Downloads' ) } wide withBorder>
				<LayoutTop>
					<LayoutHeader>
						<Title>{ translate( 'CRM Downloads' ) }</Title>
					</LayoutHeader>
				</LayoutTop>

				<LayoutBody>
					<CrmDownloadsContent licenseKey={ licenseKey } />
				</LayoutBody>
			</Layout>
		</>
	);
}

export default CrmDownloads;
