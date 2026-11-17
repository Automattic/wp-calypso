import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import AssignLicenseModal from '../../../marketplace/purchases/assign-license-modal';
import SiteConfigurationModal from '../../../marketplace/purchases/site-configuration-modal';
import { getProductName } from '../lib/get-product-name';
import { canPlacePurchase, isWpcomHostingPurchase } from '../lib/purchase-placement';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

// One event covers both flows. It is recorded when the modal mounts, which is
// the moment the action is chosen.
function useRecordPlacementStart() {
	const { recordTracksEvent } = useAnalytics();
	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_referrals_assign_purchase_to_site_button_click' );
	}, [ recordTracksEvent ] );
}

function CreateSiteModal( {
	purchase,
	closeModal,
}: {
	purchase: ReferralPurchase;
	closeModal?: () => void;
} ) {
	useRecordPlacementStart();
	return (
		<SiteConfigurationModal licenseKey={ purchase.license.license_key } closeModal={ closeModal } />
	);
}

function AssignToSiteModal( {
	purchase,
	products,
	clientEmail,
	closeModal,
}: {
	purchase: ReferralPurchase;
	products?: AgencyProduct[];
	clientEmail?: string;
	closeModal?: () => void;
} ) {
	useRecordPlacementStart();
	return (
		<AssignLicenseModal
			licenseKey={ purchase.license.license_key }
			productName={ getProductName( purchase, products ) }
			issuedAt={ purchase.license.issued_at }
			clientEmail={ clientEmail }
			closeModal={ closeModal }
		/>
	);
}

/**
 * Puts a paid purchase on a site from where it is listed: a new site for WordPress.com
 * hosting, an existing site for everything else. One action, so list layouts show it without
 * an actions menu.
 */
export function usePlacePurchaseActions< Item extends ReferralPurchase >( {
	products,
	clientEmail,
}: {
	products?: AgencyProduct[];
	clientEmail?: string;
} ) {
	return useMemo< Action< Item >[] >(
		() => [
			{
				id: 'place-purchase',
				label: ( [ item ] ) =>
					item && isWpcomHostingPurchase( item ) ? __( 'Create site' ) : __( 'Assign to site' ),
				isPrimary: true,
				isEligible: canPlacePurchase,
				modalHeader: ( [ item ] ) =>
					item && isWpcomHostingPurchase( item )
						? __( 'Configure your new site' )
						: __( 'Assign a license to a site' ),
				modalSize: 'medium',
				RenderModal: ( { items: [ item ], closeModal } ) =>
					isWpcomHostingPurchase( item ) ? (
						<CreateSiteModal purchase={ item } closeModal={ closeModal } />
					) : (
						<AssignToSiteModal
							purchase={ item }
							products={ products }
							clientEmail={ clientEmail }
							closeModal={ closeModal }
						/>
					),
			},
		],
		[ products, clientEmail ]
	);
}
