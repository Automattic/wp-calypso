import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState, SetStateAction } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import useHandleReferralArchive from '../../hooks/use-handle-referral-archive';
import useHandleReferralResend from '../../hooks/use-handle-referral-resend';
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

	const { handleResendReferralEmail, isPending: isResendingReferralEmail } =
		useHandleReferralResend();

	const { data: productsData, isFetching: isFetchingProducts } = useProductsQuery(
		false,
		false,
		true
	);

	const referralActions = [
		{
			id: 'resend-referral-email',
			label: translate( 'Resend email' ),
			isPrimary: false,
			disabled: isResendingReferralEmail,
			callback( items: SetStateAction< ReferralAPIResponse | null >[] ) {
				dispatch( recordTracksEvent( 'calypso_a4a_referrals_resend_email_button_click' ) );
				const referral = items[ 0 ] as ReferralAPIResponse;
				if ( referral ) {
					handleResendReferralEmail( referral );
				}
			},
			isEligible( referral: ReferralAPIResponse ) {
				return referral.status === 'pending';
			},
		},
		{
			id: 'copy-link',
			label: translate( 'Copy link' ),
			isPrimary: false,
			callback( items: SetStateAction< ReferralAPIResponse | null >[] ) {
				const referral = items[ 0 ] as ReferralAPIResponse;
				if ( referral?.checkout_url ) {
					dispatch( recordTracksEvent( 'calypso_a4a_referrals_copy_link_button_click' ) );
					navigator.clipboard
						.writeText( referral.checkout_url )
						.then( () => {
							dispatch(
								successNotice( translate( 'Link has been copied to clipboard' ), {
									id: 'copy-referral-link-success',
									duration: 3000,
								} )
							);
						} )
						.catch( () => {
							dispatch(
								errorNotice( translate( "Couldn't copy link to clipboard" ), {
									id: 'copy-referral-link-error',
									duration: 5000,
								} )
							);
						} );
				}
			},
			isEligible( referral: ReferralAPIResponse ) {
				return referral.status === 'pending';
			},
		},
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
