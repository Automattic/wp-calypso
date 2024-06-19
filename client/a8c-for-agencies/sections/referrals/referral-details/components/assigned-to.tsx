import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { addQueryArgs, urlToSlug } from 'calypso/lib/url';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import StatusBadge from '../../common/step-section-item/status-badge';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	handleAssignToSite: ( redirectUrl: string ) => void;
	data?: APIProductFamilyProduct[];
};

const AssignedTo = ( { purchase, handleAssignToSite, data, isFetching }: Props ) => {
	const translate = useTranslate();
	const product = data?.find( ( product ) => product.product_id === purchase.product_id );
	const isWPCOMLicense = product?.family_slug === 'wpcom-hosting';
	const redirectUrl =
		purchase.license_key &&
		( isWPCOMLicense
			? addQueryArgs( { license_key: purchase.license_key }, A4A_SITES_LINK_NEEDS_SETUP )
			: addQueryArgs( { key: purchase.license_key }, '/marketplace/assign-license' ) );

	const isDisabled = purchase.status !== 'active' || isFetching || ! product || ! redirectUrl;

	return purchase.site_assigned ? (
		<Button
			className="referrals-purchases__assign-button"
			borderless
			href={ `/sites/overview/${ urlToSlug( purchase.site_assigned ) }` }
		>
			{ urlToSlug( purchase.site_assigned ) }
		</Button>
	) : (
		<>
			<StatusBadge statusProps={ { children: translate( 'Unassigned' ), type: 'warning' } } />

			<Button
				disabled={ isDisabled }
				className="referrals-purchases__assign-button"
				borderless
				onClick={ () => handleAssignToSite( redirectUrl ) }
			>
				{ isWPCOMLicense ? translate( 'Create site' ) : translate( 'Assign to site' ) }
			</Button>
		</>
	);
};

export default AssignedTo;
