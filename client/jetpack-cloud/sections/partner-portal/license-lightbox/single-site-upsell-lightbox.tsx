import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useContext, useCallback } from 'react';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import useSubmitForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/hooks/use-submit-form';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import LicenseLightboxPurchaseViaJetpackcom from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/license-lightbox-purchase-via-jetpackcom';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';

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

	const onHideLicenseInfo = useCallback( () => {
		hideLicenseInfo();
		onClose?.();
	}, [ hideLicenseInfo, onClose ] );

	const sites = useSelector( getSites );

	const selectedSite = siteId
		? sites.find( ( site ) => site?.ID === parseInt( siteId as unknown as string ) )
		: null;

	const { submitForm } = useSubmitForm( selectedSite );

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
		submitForm( [
			{
				...currentProduct,
				quantity: 1,
			},
		] );
	}, [ currentProduct, dispatch, onHideLicenseInfo, submitForm ] );

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
						<LicenseLightboxPurchaseViaJetpackcom
							productSlug={ productSlug }
							onClose={ hideLicenseInfo }
							siteId={ siteId }
						/>
					}
					showPaymentPlan
				/>
			) }
		</>
	);
}
