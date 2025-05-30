import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState, SetStateAction } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useHandleReferralArchive from '../../hooks/use-handle-referral-archive';
import ClientReferrals from '../client-referrals';
import ClientReferralsMobile from '../mobile/referrals-mobile';
import type { ReferralAPIResponse } from '../../types';

const ReferralDetailsReferrals = ( { referrals }: { referrals: ReferralAPIResponse[] } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const [ referralForArchive, setReferralForArchive ] = useState< ReferralAPIResponse | null >(
		null
	);

	const { handleArchiveReferral, isPending: isArchivingReferral } = useHandleReferralArchive();

	const { data: productsData, isFetching: isFetchingProducts } = useProductsQuery(
		false,
		false,
		true
	);

	const referralActions = [
		{
			id: 'archive-referral',
			label: translate( 'Archive' ),
			isPrimary: false,
			callback( items: SetStateAction< ReferralAPIResponse | null >[] ) {
				dispatch( recordTracksEvent( 'calypso_a4a_referrals_archive_referral_button_click' ) );
				setReferralForArchive( items[ 0 ] );
			},
			isEligible( referral: ReferralAPIResponse ) {
				return referral.status !== 'archived' && referral.status !== 'active';
			},
		},
	];

	return (
		<>
			{ ! isDesktop ? (
				<ClientReferralsMobile
					referrals={ referrals }
					isFetchingProducts={ isFetchingProducts }
					productsData={ productsData }
					actions={ referralActions }
				/>
			) : (
				<ClientReferrals
					referrals={ referrals }
					isFetchingProducts={ isFetchingProducts }
					productsData={ productsData }
					actions={ referralActions }
				/>
			) }
			{ referralForArchive && (
				<A4AConfirmationDialog
					title={ translate( 'Are you sure you want to archive this referral?' ) }
					onClose={ () => setReferralForArchive( null ) }
					onConfirm={ () => {
						handleArchiveReferral( referralForArchive, () => {
							setReferralForArchive( null );
						} );
					} }
					closeLabel={ translate( 'Keep referral' ) }
					ctaLabel={ translate( 'Archive' ) }
					isDestructive
					isLoading={ isArchivingReferral }
				>
					{ translate(
						"Your client won't be able to complete the purchases. If removed, you must create a new referral for any future purchases."
					) }
				</A4AConfirmationDialog>
			) }
		</>
	);
};

export default ReferralDetailsReferrals;
