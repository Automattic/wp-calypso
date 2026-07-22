import {
	activeAgencyQuery,
	agencyMigrationCommissionSitesQuery,
	requestMigrationReverificationMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Modal,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import useMinimizeHelpCenterOnMount from 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount';
import type {
	RecordTracksEvent,
	ShowSuccessNotice,
	TaggedSite,
} from 'calypso/dashboard/agency/earn/migrations/types';
import type { ReactNode } from 'react';

export default function RequestReviewModal( {
	onClose,
	site,
	recordTracksEvent,
	onSuccess,
	onError,
}: {
	onClose: () => void;
	site: TaggedSite;
	recordTracksEvent: RecordTracksEvent;
	onSuccess: ShowSuccessNotice;
	onError: ( message: ReactNode ) => void;
} ) {
	const queryClient = useQueryClient();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	useMinimizeHelpCenterOnMount();

	const { mutate: requestReview, isPending } = useMutation(
		requestMigrationReverificationMutation( agencyId )
	);

	const [ reason, setReason ] = useState( '' );

	const isValid = reason.trim().length > 0;

	const handleSubmit = () => {
		requestReview(
			{
				siteId: site.id,
				reason: reason.trim(),
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries( {
						queryKey: agencyMigrationCommissionSitesQuery( agencyId ).queryKey,
					} );
					recordTracksEvent( 'calypso_a4a_migrations_request_another_review_success', {
						site_id: site.id,
					} );
					onSuccess(
						createInterpolateElement(
							sprintf(
								/* translators: %s: the site URL */
								__( 'Your verification request for <strong>%s</strong> has been submitted.' ),
								site.url
							),
							{ strong: <strong /> }
						),
						{ id: 'a4a-commission-request-review-success', duration: 5000 }
					);
					onClose();
				},
				onError: ( error ) => {
					onError( error.message );
				},
			}
		);
		recordTracksEvent( 'calypso_a4a_migrations_request_another_review_submit', {
			site_id: site.id,
		} );
	};

	const handleOnClose = () => {
		onClose();
		recordTracksEvent( 'calypso_a4a_migrations_request_another_review_close' );
	};

	return (
		<Modal
			title={ __( 'Request another verification' ) }
			onRequestClose={ handleOnClose }
			size="medium"
		>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						sprintf(
							/* translators: %s: the site URL */
							__( 'Please specify why <strong>%s</strong> needs to be verified again.' ),
							site.url
						),
						{ strong: <strong /> }
					) }
				</Text>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Reason for re-verification' ) }
					value={ reason }
					onChange={ setReason }
					placeholder={ __( 'Describe why this site needs to be verified again' ) }
					rows={ 4 }
				/>
				<HStack justify="flex-end" spacing={ 3 }>
					<Button variant="tertiary" onClick={ handleOnClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleSubmit }
						disabled={ isPending || ! isValid }
						isBusy={ isPending }
					>
						{ __( 'Submit request' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
