import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import AssignLicenseStepProgress from '../../assign-license-step-progress';
import DownloadProductsForm from '../../download-products-form';

export default function DownloadProducts() {
	const translate = useTranslate();
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const products = getQueryArg( window.location.href, 'products' ) as string;
	const licenseKeysArray = products !== undefined ? products.split( ',' ) : [ licenseKey ];

	const title = translate(
		'Download and install your product',
		'Download and install your products',
		{
			count: licenseKeysArray.length,
		}
	);

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<AssignLicenseStepProgress currentStep="downloadProducts" showDownloadStep />

				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<DownloadProductsForm />
			</LayoutBody>
		</Layout>
	);
}
