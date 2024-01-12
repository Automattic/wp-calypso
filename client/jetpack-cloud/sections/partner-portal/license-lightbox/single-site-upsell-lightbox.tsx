import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useCallback } from 'react';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { addQueryArgs } from 'calypso/lib/url';
import { getPurchaseURLCallback } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	currentProduct: APIProductFamilyProduct;
	partnerCanIssueLicense: boolean;
	productSlug: string;
	onClose: () => void;
	siteId?: number;
}

export default function SingleSiteUpsellLightbox( {
	currentProduct,
	partnerCanIssueLicense,
	productSlug,
	onClose,
	siteId,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { hideLicenseInfo } = useContext( SitesOverviewContext );

	const item = slugToSelectorProduct( productSlug ) as SelectorProduct;

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

	const onIssueLicense = useCallback( () => {
		if ( ! currentProduct ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_jetpack_single_site_upsell_purchase_click', {
				product: currentProduct.slug,
			} )
		);
		onHideLicenseInfo();
		page(
			addQueryArgs(
				{
					product_slug: currentProduct.slug,
					source: 'dashboard',
					site_id: siteId,
				},
				'/partner-portal/issue-license/'
			)
		);
	}, [ currentProduct, dispatch, onHideLicenseInfo, siteId ] );

	const onProceedToCheckout = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_single_site_upsell_proceed_to_checkout_click', {
				product: currentProduct.slug,
			} )
		);
		onHideLicenseInfo();
	}, [ currentProduct, dispatch, onHideLicenseInfo ] );

	const learnMoreLink =
		'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-billing-payment-faqs';

	const onClickLearnMore = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_issue_license_review_licenses_learn_more_click' )
		);
	}, [ dispatch ] );

	return (
		<>
			{ true && (
				<LicenseLightbox
					className="license-lightbox__single-site-upsell"
					product={ currentProduct }
					isDisabled={ ! partnerCanIssueLicense }
					ctaLabel={ translate( 'Issue License' ) }
					onActivate={ onIssueLicense }
					onClose={ onClose }
					extraAsideContent={
						<div className="review-licenses__notice">
							{ translate(
								'You will be billed at the end of every month. Your first month may be less than the above amount. {{a}}Learn more{{/a}}',
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
					}
					secondaryAsideContent={
						//
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
					}
					showPaymentPlan
				/>
			) }
		</>
	);
}
