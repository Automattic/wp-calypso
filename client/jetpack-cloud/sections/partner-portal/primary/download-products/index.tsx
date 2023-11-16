import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import DownloadProductsForm from 'calypso/jetpack-cloud/sections/partner-portal/download-products-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';

import './styles.scss';

export default function DownloadProducts() {
	const translate = useTranslate();
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const products = getQueryArg( window.location.href, 'products' ) as string;
	const licenseKeysArray = products !== undefined ? products.split( ',' ) : [ licenseKey ];

	const scrollToTop = () => {
		window.scrollTo( 0, 0 );
	};

	useLayoutEffect( () => {
		scrollToTop();
	}, [] );

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-download-products';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Main wideLayout className="download-products">
			<DocumentHead
				title={ translate(
					'Download and Install your product',
					'Download and Install your products',
					{
						count: licenseKeysArray.length,
					}
				) }
			/>
			<SidebarNavigation />
			<AssignLicenseStepProgress currentStep="downloadProducts" showDownloadStep />
			<CardHeading size={ 36 }>
				{ translate( 'Download and install your product', 'Download and install your products', {
					count: licenseKeysArray.length,
				} ) }
			</CardHeading>

			<DownloadProductsForm />
		</Main>
	);
}
