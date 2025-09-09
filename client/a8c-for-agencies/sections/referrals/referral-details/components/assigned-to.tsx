import { BadgeType, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
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

	let tooltip = '';

	const isAwaitingPayment = purchase.status === 'pending';

	if ( isAwaitingPayment ) {
		tooltip = isWPCOMLicense
			? translate( 'When your client pays, you can initiate this site.' )
			: translate( 'When your client pays, you can assign this product to a site.' );
	}

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

	return (
		<>
			<StatusBadge
				statusProps={ {
					children: statusText,
					type: statusType,
					tooltip,
				} }
			/>
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
		</>
	);
};

export default AssignedTo;
