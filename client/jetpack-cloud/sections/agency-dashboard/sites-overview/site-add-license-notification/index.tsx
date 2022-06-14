import { useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Banner from 'calypso/components/banner';
import { setPurchasedProduct } from 'calypso/state/jetpack-agency-dashboard/actions';
import type { PurchasedProduct } from '../types';

import './style.scss';

export default function SiteAddLicenseNotification( {
	purchasedLicense,
}: {
	purchasedLicense: PurchasedProduct;
} ): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const selectedSite = purchasedLicense.selectedSite;
	const selectedProduct = purchasedLicense.selectedProduct;

	const dismissBanner = useCallback( () => {
		dispatch( setPurchasedProduct() );
	}, [ dispatch ] );

	useEffect( () => {
		return () => {
			dismissBanner();
		};
	}, [ dismissBanner ] );

	if ( ! selectedSite || ! selectedProduct ) {
		return null;
	}

	return (
		<div className="site-add-license-notification__license-banner">
			<Banner
				title={ translate(
					'A {{strong}}%(selectedProduct)s{{/strong}} license was succesfully assigned to {{em}}%(selectedSite)s{{/em}}. Please allow a few minutes for your features to activate.',
					{
						args: {
							selectedProduct,
							selectedSite,
						},
						components: {
							strong: <strong />,
							em: <em />,
						},
					}
				) }
				disableCircle
				horizontal
				dismissWithoutSavingPreference
				onDismiss={ dismissBanner }
				icon="info-outline"
				callToAction={ translate( 'View License Details' ) }
				href={ '/partner-portal/licenses' }
			/>
		</div>
	);
}
