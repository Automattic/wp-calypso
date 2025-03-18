import { useTranslate } from 'i18n-calypso';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { CrmDownloadsContent } from 'calypso/components/crm-downloads/crm-downloads';
import DocumentHead from 'calypso/components/data/document-head';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';

import './style.scss';

export function CrmDownloads( { licenseKey }: { licenseKey: string } ) {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'CRM Downloads' ) } />
			<PageViewTracker
				title="Purchases > CRM Downloads"
				path="/purchases/crm-downloads/:site/:licenseKey"
			/>

			<Layout
				className="crm-downloads crm-downloads-agencies"
				title={ translate( 'CRM Downloads' ) }
				wide
				withBorder
				sidebarNavigation={ <MobileSidebarNavigation /> }
			>
				<LayoutHeader>
					<Title>{ translate( 'CRM Downloads' ) }</Title>
				</LayoutHeader>

				<LayoutBody>
					<CrmDownloadsContent licenseKey={ licenseKey } />
				</LayoutBody>
			</Layout>
		</>
	);
}

export default CrmDownloads;
