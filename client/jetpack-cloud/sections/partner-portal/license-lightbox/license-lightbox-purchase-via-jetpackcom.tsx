import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useContext, useCallback } from 'react';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import { getPurchaseURLCallback } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';

import './style.scss';

type Props = {
	nonManageProductSlug: string;
	onClose: () => void;
	siteId?: number;
};

const LicenseLightboxPurchaseViaJetpackcom: FunctionComponent< Props > = ( {
	nonManageProductSlug,
	onClose,
	siteId,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { hideLicenseInfo } = useContext( SitesOverviewContext );

	const item = slugToSelectorProduct( nonManageProductSlug ) as SelectorProduct;

	const selectedSiteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) || '';

	const createCheckoutURL = getPurchaseURLCallback( selectedSiteSlug, {
		// For the Backup, Search, Scan upsell in Jetpack Cloud, we want to redirect back here to the Backup page after checkout.
		redirect_to: window.location.href,
	} );

	const checkoutURL = createCheckoutURL && createCheckoutURL( item, false );
	const onHideLicenseInfo = useCallback( () => {
		hideLicenseInfo();
		onClose?.();
	}, [ hideLicenseInfo, onClose ] );

	const onProceedToCheckout = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_single_site_upsell_proceed_to_checkout_click', {
				product: nonManageProductSlug,
			} )
		);
		onHideLicenseInfo();
	}, [ nonManageProductSlug, dispatch, onHideLicenseInfo ] );

	const learnMoreLink = localizeUrl(
		'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-billing-payment-faqs'
	);

	const onClickLearnMore = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_issue_license_review_licenses_learn_more_click' )
		);
	}, [ dispatch ] );

	return (
		<>
			<div className="license-lightbox__secondary-checkout-heading">
				{ translate( 'Purchase a yearly license:' ) }
			</div>
			<Button
				onClick={ onProceedToCheckout }
				className="license-lightbox__secondary-content-button"
				href={ checkoutURL }
				disabled={ false }
			>
				{ translate( 'Purchase via Jetpack.com' ) }
			</Button>
			<div className="license-lightbox__secondary-checkout-notice">
				{ translate(
					"You will be able to add a new credit card during the checkout process. Use this method if you're billing a product to your client's credit card. {{a}}Learn more{{/a}}",
					{
						components: {
							a: (
								<a
									href={ learnMoreLink }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ onClickLearnMore }
								/>
							),
						},
					}
				) }
			</div>
		</>
	);
};

export default LicenseLightboxPurchaseViaJetpackcom;
