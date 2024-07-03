import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import JetpackComMasterbar, {
	MAIN_CONTENT_ID,
} from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar';
import { Recommendations } from 'calypso/my-sites/plans/jetpack-plans/product-store/recommendations';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import Header from '../header';
import { LicenseProductsList } from '../license-products-list';
import 'calypso/my-sites/plans/jetpack-plans/product-store/style.scss';
import 'calypso/jetpack-cloud/sections/pricing/style.scss';
import './style.scss';
import PricingLicenseSelector from '../pricing-license-selector';
import PricingNeedMoreInfo from '../pricing-need-more-info';

const DEFAULT_SELECTED_BUNDLE_SIZE = 5;

export default function ManagePricingPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedSize, setSelectedSize ] = useState< number >( DEFAULT_SELECTED_BUNDLE_SIZE );
	const currentRoute = useSelector( getCurrentRoute );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_pricing_page_visit', {
				path: currentRoute,
			} )
		);
	}, [ dispatch, currentRoute ] );

	return (
		<>
			<JetpackComMasterbar />
			<Main
				className={ clsx( 'selector__main', 'fs-unmask', 'jetpack-manage-pricing-page' ) }
				id={ MAIN_CONTENT_ID }
				wideLayout
			>
				<DocumentHead
					title={ translate(
						'Jetpack Manage: Bulk discounts and flexible billing to suit your needs'
					) }
				/>
				<div className="jetpack-product-store">
					<Header />
					<PricingLicenseSelector
						selectedSize={ selectedSize }
						setSelectedSize={ setSelectedSize }
					/>
					<LicenseProductsList bundleSize={ selectedSize } />
					<PricingNeedMoreInfo />
					<Recommendations />
				</div>
			</Main>
			<JetpackComFooter />
		</>
	);
}
