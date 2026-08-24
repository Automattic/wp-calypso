import { Badge } from '@automattic/ui';
import { ExternalLink, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import RouterLinkButton from '../../../../components/router-link-button';
import { urlToSlug } from '../../../../utils/url';
import { findAgencyProduct } from '../lib/get-product-name';
import { getPurchaseStatus } from '../lib/get-purchase-status';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

const PRESSABLE_AUTH_URL = 'https://my.pressable.com/agency/auth';

export default function PurchaseSiteDetails( {
	purchase,
	products,
}: {
	purchase: ReferralPurchase;
	products?: AgencyProduct[];
} ) {
	const licenseKey = purchase.license?.license_key ?? '';

	if ( licenseKey.startsWith( 'pressable-' ) ) {
		return <ExternalLink href={ PRESSABLE_AUTH_URL }>{ __( 'Manage in Pressable' ) }</ExternalLink>;
	}

	if ( purchase.site_assigned ) {
		const product = findAgencyProduct( purchase.product_id, products );
		if ( product?.slug.startsWith( 'pressable' ) ) {
			return <Badge intent="success">{ __( 'Pressable' ) }</Badge>;
		}

		const siteSlug = urlToSlug( purchase.site_assigned );
		return (
			<RouterLinkButton variant="link" to="/sites/$siteSlug" params={ { siteSlug } }>
				{ siteSlug }
			</RouterLinkButton>
		);
	}

	const { status, type } = getPurchaseStatus( purchase );
	const badge = <Badge intent={ type }>{ status }</Badge>;

	if ( purchase.status !== 'pending' ) {
		return badge;
	}

	const tooltip = licenseKey.startsWith( 'wpcom-hosting' )
		? __( 'When your client pays, you can initiate this site.' )
		: __( 'When your client pays, you can assign this product to a site.' );

	// Badge does not forward refs, so Tooltip needs a DOM element to anchor to.
	return (
		<Tooltip text={ tooltip }>
			<span style={ { display: 'inline-flex' } }>{ badge }</span>
		</Tooltip>
	);
}
