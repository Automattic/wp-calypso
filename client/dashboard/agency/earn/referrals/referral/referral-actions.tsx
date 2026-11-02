import { archiveReferralMutation, resendReferralEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import { Text } from '../../../../components/text';
import type { ReferralApiResponse } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

// The server explains why a referral cannot be archived or its email resent
// (an order already paid for, a bounced address), so its message wins.
const getErrorMessage = ( error: unknown, fallback: string ) =>
	( error instanceof Error && error.message ) || fallback;

export function useReferralActions( agencyId: number ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: archiveReferral, isPending: isArchiving } = useMutation(
		withSnackbar( archiveReferralMutation( agencyId ), {
			success: __( 'The referral has been archived.' ),
		} )
	);
	const { mutate: resendReferralEmail, isPending: isResending } = useMutation(
		withSnackbar( resendReferralEmailMutation( agencyId ), {
			success: __( 'The referral email has been resent.' ),
		} )
	);

	return useMemo< Action< ReferralApiResponse >[] >(
		() => [
			{
				id: 'resend-email',
				label: __( 'Resend email' ),
				isPrimary: true,
				isEligible: ( item ) => item.status === 'pending',
				disabled: isResending,
				callback: ( items ) => {
					const order = items[ 0 ];
					if ( ! order ) {
						return;
					}
					recordTracksEvent( 'calypso_a4a_referrals_resend_email_button_click' );
					resendReferralEmail( order.id, {
						onError: ( error ) =>
							createErrorNotice(
								getErrorMessage( error, __( 'Failed to resend the referral email.' ) ),
								{ type: 'snackbar' }
							),
					} );
				},
			},
			{
				id: 'copy-link',
				label: __( 'Copy link' ),
				isEligible: ( item ) => item.status === 'pending' && !! item.checkout_url,
				callback: ( items ) => {
					const order = items[ 0 ];
					if ( ! order?.checkout_url ) {
						return;
					}
					recordTracksEvent( 'calypso_a4a_referrals_copy_link_button_click' );
					navigator.clipboard
						.writeText( order.checkout_url )
						.then( () =>
							createSuccessNotice( __( 'Link copied to clipboard.' ), { type: 'snackbar' } )
						)
						.catch( () =>
							createErrorNotice( __( 'Failed to copy the link to clipboard.' ), {
								type: 'snackbar',
							} )
						);
				},
			},
			{
				id: 'archive',
				label: __( 'Archive' ),
				isDestructive: true,
				isEligible: ( item ) => item.status !== 'archived' && item.status !== 'active',
				RenderModal: ( { items, closeModal } ) => {
					const order = items[ 0 ];
					const onConfirm = () => {
						if ( ! order ) {
							return;
						}
						recordTracksEvent( 'calypso_a4a_referrals_archive_referral_button_click' );
						// The modal stays up until the request settles, so the confirm
						// button can show that something is happening.
						archiveReferral( order.id, {
							onError: ( error ) =>
								createErrorNotice(
									getErrorMessage( error, __( 'Failed to archive the referral.' ) ),
									{ type: 'snackbar' }
								),
							onSettled: () => closeModal?.(),
						} );
					};
					return (
						<VStack spacing={ 4 }>
							<Text>
								{ __(
									"Your client won't be able to complete the purchases. If removed, you must create a new referral for any future purchases."
								) }
							</Text>
							<HStack justify="right">
								<Button
									__next40pxDefaultSize
									variant="tertiary"
									onClick={ () => closeModal?.() }
									disabled={ isArchiving }
									accessibleWhenDisabled
								>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									__next40pxDefaultSize
									variant="primary"
									onClick={ onConfirm }
									isBusy={ isArchiving }
									disabled={ isArchiving }
									accessibleWhenDisabled
									isDestructive
								>
									{ __( 'Archive' ) }
								</Button>
							</HStack>
						</VStack>
					);
				},
			},
		],
		[
			archiveReferral,
			isArchiving,
			isResending,
			resendReferralEmail,
			createSuccessNotice,
			createErrorNotice,
			recordTracksEvent,
		]
	);
}
