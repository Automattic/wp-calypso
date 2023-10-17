import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import AssignLicenseForm from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-form';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import isWooCommerceProduct from 'calypso/jetpack-cloud/sections/partner-portal/lib/is-woocommerce-product';

import './styles.scss';

export default function AssignLicense( {
	sites,
	currentPage,
	search,
}: {
	sites: Array< any >;
	currentPage: number;
	search: string;
} ) {
	const translate = useTranslate();
	const licenseKey = getQueryArg( window.location.href, 'key' ) as string;
	const products = getQueryArg( window.location.href, 'products' ) as string;
	const licenseKeysArray = products !== undefined ? products.split( ',' ) : [ licenseKey ];
	const showDownloadStep = licenseKeysArray.some( isWooCommerceProduct );

	const scrollToTop = () => {
		window.scrollTo( 0, 0 );
	};

	useLayoutEffect( () => {
		scrollToTop();
	}, [] );

	useEffect( () => {
		const layoutClass = 'layout__content--partner-portal-assign-license';
		const content = document.getElementById( 'content' );

		if ( content ) {
			content.classList.add( layoutClass );

			return () => content.classList.remove( layoutClass );
		}
	}, [] );

	return (
		<Main wideLayout className="assign-license">
			<AssignLicenseStepProgress
				currentStep="assignLicense"
				showDownloadStep={ showDownloadStep }
			/>
			<DocumentHead
				title={ translate( 'Assign your license', 'Assign your licenses', {
					count: licenseKeysArray.length,
				} ) }
			/>
			<SidebarNavigation />
			<CardHeading size={ 36 }>
				{ translate( 'Assign your license', 'Assign your licenses', {
					count: licenseKeysArray.length,
				} ) }
			</CardHeading>
			<AssignLicenseForm sites={ sites } currentPage={ currentPage } search={ search } />
		</Main>
	);
}
