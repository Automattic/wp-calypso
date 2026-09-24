import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Popover,
	Tooltip,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { useLocale } from '../../../../app/locale';
import RouterLinkButton from '../../../../components/router-link-button';
import { Text } from '../../../../components/text';
import { formatDate } from '../../../../utils/datetime';
import { urlToSlug } from '../../../../utils/url';
import { findAgencyProduct } from '../lib/get-product-name';
import { getPurchaseStatus } from '../lib/get-purchase-status';
import { isCancelledButActive } from '../lib/purchase-placement';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

import './purchase-site-details.scss';

const PRESSABLE_AUTH_URL = 'https://my.pressable.com/agency/auth';
const CANCELLATION_SUPPORT_URL =
	'https://wordpress.com/support/manage-purchases/cancel-a-purchase/';

function CancellationInfo( { expiry }: { expiry?: string } ) {
	const locale = useLocale();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState< HTMLButtonElement | null >( null );

	const expiryDate = expiry ? formatDate( new Date( expiry ), locale, { dateStyle: 'long' } ) : '';

	return (
		<>
			<Button
				size="small"
				icon={ info }
				iconSize={ 18 }
				ref={ setAnchor }
				aria-label={ __( 'More information about cancellation' ) }
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( visible ) => ! visible ) }
			/>
			{ isOpen && (
				<Popover
					anchor={ anchor }
					placement="bottom"
					offset={ 8 }
					shift
					resize={ false }
					focusOnMount
					onFocusOutside={ () => setIsOpen( false ) }
					onClose={ () => setIsOpen( false ) }
				>
					<VStack className="referrals-cancellation-popover" spacing={ 3 }>
						<Text>
							{ createInterpolateElement(
								/* translators: <expiryDate /> is the date the product expires, e.g. "January 5, 2026". */
								__(
									'This product was cancelled, but it will remain active until <expiryDate />. After that, it will not renew.'
								),
								{ expiryDate: <b>{ expiryDate || __( 'N/A' ) }</b> }
							) }
						</Text>
						<Text>
							<ExternalLink href={ localizeUrl( CANCELLATION_SUPPORT_URL ) }>
								{ __( 'Learn more about cancelations' ) }
							</ExternalLink>
						</Text>
					</VStack>
				</Popover>
			) }
		</>
	);
}

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
			return <Badge intent="stable">{ __( 'Pressable' ) }</Badge>;
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

	let tooltip;
	if ( purchase.status === 'pending' ) {
		tooltip = licenseKey.startsWith( 'wpcom-hosting' )
			? __( 'When your client pays, you can initiate this site.' )
			: __( 'When your client pays, you can assign this product to a site.' );
	}

	return (
		<HStack spacing={ 1 } justify="flex-start" alignment="center" expanded={ false }>
			{ tooltip ? <Tooltip text={ tooltip }>{ badge }</Tooltip> : badge }
			{ isCancelledButActive( purchase ) && (
				<CancellationInfo expiry={ purchase.subscription?.expiry } />
			) }
		</HStack>
	);
}
