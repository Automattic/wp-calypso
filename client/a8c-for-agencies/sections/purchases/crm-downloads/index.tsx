import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { CrmDownloadsContent } from 'calypso/components/crm-downloads/crm-downloads';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';
import './style.scss';

export function CrmDownloads( { licenseKey }: { licenseKey: string } ) {
	const translate = useTranslate();

	return (
		<Layout className="crm-downloads" wide title={ translate( 'CRM Downloads' ) }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'CRM Downloads' ) }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<CrmDownloadsContent licenseKey={ licenseKey } />
			</LayoutBody>
		</Layout>
	);
}

export default CrmDownloads;
