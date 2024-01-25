import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import useSubmitForm from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-submit-form';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import LicenseLightboxPurchaseViaJetpackcom from './license-lightbox-purchase-via-jetpackcom';

interface Props {
	manageProduct: APIProductFamilyProduct;
	partnerCanIssueLicense: boolean;
	nonManageProductSlug: string;
	nonManageProductPrice?: number | null;
	onClose: () => void;
	siteId?: number;
}

export default function SingleSiteUpsellLightbox( {
	manageProduct,
	partnerCanIssueLicense,
	nonManageProductSlug,
	nonManageProductPrice,
	onClose,
	siteId,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onHideLicenseInfo = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_upsell_lightbox_closed' ) );
		onClose?.();
	}, [ dispatch, onClose ] );

	const sites = useSelector( getSites );

	const selectedSite = siteId
		? sites.find( ( site ) => site?.ID === parseInt( siteId as unknown as string ) )
		: null;

	const { submitForm } = useSubmitForm( selectedSite );

	const onIssueLicense = useCallback( () => {
		if ( ! manageProduct ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_jetpack_single_site_upsell_purchase_click', {
				product: manageProduct.slug,
			} )
		);
		submitForm( [
			{
				...manageProduct,
				quantity: 1,
			},
		] );
	}, [ manageProduct, dispatch, submitForm ] );

	const learnMoreLink = localizeUrl(
		'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-billing-payment-faqs'
	);

	const onClickLearnMore = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_issue_license_review_licenses_learn_more_click' )
		);
	}, [ dispatch ] );

	// Recording the event when the lightbox is displayed.
	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_upsell_lightbox_opened' ) );
		// We only want to run this once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<LicenseLightbox
			className="license-lightbox__single-site-upsell"
			product={ manageProduct }
			isDisabled={ ! partnerCanIssueLicense }
			ctaLabel={ translate( 'Issue license' ) }
			onActivate={ onIssueLicense }
			fireCloseOnCTAClick={ false }
			onClose={ onHideLicenseInfo }
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
					nonManageProductSlug={ nonManageProductSlug }
					nonManageProductPrice={ nonManageProductPrice }
					siteId={ siteId }
				/>
			}
			showPaymentPlan
		/>
	);
}
