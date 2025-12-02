import { BadgeType, Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import InfoModal from 'calypso/a8c-for-agencies/components/a4a-info-modal';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { useSubscriptionDetails } from 'calypso/a8c-for-agencies/hooks/use-subscription-details';
import { isWPCOMHostingProduct } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import { addQueryArgs, urlToSlug } from 'calypso/lib/url';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	handleAssignToSite: ( redirectUrl: string ) => void;
	data?: APIProductFamilyProduct[];
};

function getPurchaseStatus(
	purchase: ReferralPurchase,
	translate: ReturnType< typeof useTranslate >
): [ BadgeType, React.ReactNode ] {
	if ( purchase.status === 'active' ) {
		if ( purchase.site_assigned ) {
			return [ 'success', translate( 'Assigned' ) ];
		}
		return [ 'warning', translate( 'Unassigned' ) ];
	}

	if ( purchase.status === 'canceled' ) {
		return [ 'info', translate( 'Canceled' ) ];
	}

	if ( purchase.status === 'error' ) {
		return [ 'error', translate( 'Error' ) ];
	}

	return [ 'warning', translate( 'Awaiting payment' ) ];
}

const AssignedTo = ( { purchase, handleAssignToSite, data, isFetching }: Props ) => {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	const product = data?.find( ( product ) => product.product_id === purchase.product_id );
	const isPressable = product?.slug.startsWith( 'pressable' );
	const licenseKey = purchase.license?.license_key || '';
	const isWPCOMLicense = isWPCOMHostingProduct( licenseKey );
	const redirectUrl =
		purchase.license &&
		( isWPCOMLicense
			? addQueryArgs( { license_key: licenseKey }, A4A_SITES_LINK_NEEDS_SETUP )
			: addQueryArgs( { key: licenseKey }, '/marketplace/assign-license' ) );

	const showAssignButton = purchase.status === 'active' && redirectUrl;
	const [ statusType, statusText ] = getPurchaseStatus( purchase, translate );
	const { expiryDate, isFetchingProductInfo } = useSubscriptionDetails( purchase );
	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement >( null );
	const popoverContentRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( showPopover && popoverContentRef.current ) {
			popoverContentRef.current.focus();
		}
	}, [ showPopover ] );

	if ( purchase.site_assigned ) {
		return isPressable ? (
			<StatusBadge
				statusProps={ {
					children: translate( 'Pressable' ),
					type: 'success',
				} }
			/>
		) : (
			<Button
				className="referrals-purchases__assign-button"
				borderless
				href={ `/sites/overview/${ urlToSlug( purchase.site_assigned ) }` }
			>
				{ urlToSlug( purchase.site_assigned ) }
			</Button>
		);
	}

	let tooltip = '';

	let cancellationInfo = null;

	// If the purchase has a subscription, get details and check the status.
	const subscription = purchase?.subscription;

	if ( subscription && subscription.status === 'active' && ! subscription.is_auto_renew_enabled ) {
		// If the subscription is still active but auto-renew is disabled, show the expiration info.
		cancellationInfo = (
			<>
				<p>
					{ translate(
						'This product was cancelled, but it will remain active until {{b}}%(expiryDate)s{{/b}}. After that, it will not renew.',
						{
							args: {
								expiryDate: isFetchingProductInfo ? '...' : expiryDate || 'N/A',
							},
							components: {
								b: <b />,
							},
							comment: '%(expiryDate)s is the date when the product will expire.',
						}
					) }
				</p>
				<p>
					{ translate( '{{link}}Learn more about cancelations ↗{{/link}}', {
						components: {
							link: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/manage-purchases/cancel-a-purchase/'
									) }
									target="_blank"
									rel="noreferrer noopener"
								>
									{  }
								</a>
							),
						},
					} ) }
				</p>
			</>
		);
	}

	const isAwaitingPayment = purchase.status === 'pending';

	if ( isAwaitingPayment ) {
		tooltip = isWPCOMLicense
			? translate( 'When your client pays, you can initiate this site.' )
			: translate( 'When your client pays, you can assign this product to a site.' );
	}

	return (
		<div className="badge-assigned-to">
			<StatusBadge
				statusProps={ {
					children: statusText,
					type: statusType,
					tooltip,
				} }
			/>
			{ cancellationInfo && (
				<span
					className="status-card__info-icon"
					onClick={ () => setShowPopover( ! showPopover ) }
					role="button"
					tabIndex={ 0 }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Enter' ) {
							setShowPopover( ! showPopover );
						}
					} }
					ref={ wrapperRef }
				>
					<Gridicon icon="info-outline" size={ 18 } />
				</span>
			) }
			{ cancellationInfo &&
				showPopover &&
				( isMobile ? (
					<InfoModal title="" onClose={ () => setShowPopover( false ) }>
						{ cancellationInfo }
					</InfoModal>
				) : (
					<A4APopover
						title=""
						wrapperRef={ wrapperRef }
						offset={ 8 }
						onFocusOutside={ () => setShowPopover( false ) }
					>
						<div tabIndex={ -1 } ref={ popoverContentRef }>
							{ cancellationInfo }
						</div>
					</A4APopover>
				) ) }
			{ showAssignButton && (
				<Button
					disabled={ isFetching }
					className="referrals-purchases__assign-button"
					borderless
					onClick={ () => handleAssignToSite( redirectUrl ) }
				>
					{ isWPCOMLicense ? translate( 'Create site' ) : translate( 'Assign to site' ) }
				</Button>
			) }
		</div>
	);
};

export default AssignedTo;
