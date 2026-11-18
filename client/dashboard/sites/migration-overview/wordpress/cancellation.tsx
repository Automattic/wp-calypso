import {
	siteQueryFilter,
	siteWordPressMigrationCancellationQuery,
	siteWordPressMigrationCancelMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Modal, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useHelpCenter } from '../../../app/help-center';
import { ButtonStack } from '../../../components/button-stack';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import type { Site } from '@automattic/api-core';

export function MigrationCancellation( { site }: { site: Site } ) {
	const queryClient = useQueryClient();
	const { setShowHelpCenter } = useHelpCenter();
	const [ isOpen, setIsOpen ] = useState( false );
	const { data, error, isFetching, refetch } = useQuery( {
		...siteWordPressMigrationCancellationQuery( site.ID ),
		enabled: isOpen,
		retry: false,
	} );
	const cancel = useMutation( siteWordPressMigrationCancelMutation( site.ID ) );

	useEffect( () => {
		if ( data?.status === 'cancelled' ) {
			queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
		}
	}, [ data?.status, queryClient, site.ID ] );

	const onClose = () => {
		if ( ! cancel.isPending ) {
			setIsOpen( false );
			cancel.reset();
		}
	};

	const requestFailed = Boolean( error || cancel.error );
	return (
		<>
			<Button
				variant="link"
				className="wordpress-migration__note-link"
				onClick={ () => setIsOpen( true ) }
			>
				{ __( 'Cancel this migration' ) }
			</Button>
			{ isOpen && (
				<Modal
					title={ __( 'Cancel migration' ) }
					onRequestClose={ onClose }
					isDismissible={ ! cancel.isPending }
					size="medium"
				>
					<VStack spacing={ 6 }>
						{ requestFailed ? (
							<Notice variant="error">
								{ __(
									'We couldn’t check whether it’s safe to cancel. Please try again or contact support.'
								) }
							</Notice>
						) : (
							<>
								{ ! data && <Spinner /> }
								{ data?.status === 'wait' && (
									<Text>
										{ __(
											'Migration work is still in progress. Wait for it to finish, then try again.'
										) }
									</Text>
								) }
								{ data?.status === 'support' && (
									<Text>
										{ __(
											'This migration may have changed your destination site. Contact support for help cancelling it.'
										) }
									</Text>
								) }
								{ data?.status === 'ready' && (
									<Text>
										{ __(
											'Cancel this migration and return to your site dashboard? Your plan and domain stay active.'
										) }
									</Text>
								) }
								{ data?.status === 'cancelled' && (
									<Text>{ __( 'Your migration has been cancelled.' ) }</Text>
								) }
							</>
						) }
						<ButtonStack justify="flex-end">
							{ ( requestFailed || data?.status === 'support' ) && (
								<Button
									variant="secondary"
									onClick={ () => {
										onClose();
										setShowHelpCenter( true );
									} }
								>
									{ __( 'Contact us' ) }
								</Button>
							) }
							{ ( requestFailed || data?.status === 'wait' ) && (
								<Button
									variant="secondary"
									disabled={ isFetching }
									onClick={ () => {
										cancel.reset();
										refetch();
									} }
								>
									{ __( 'Try again' ) }
								</Button>
							) }
							{ ! requestFailed && data?.status === 'ready' && (
								<>
									<Button variant="tertiary" disabled={ cancel.isPending } onClick={ onClose }>
										{ __( 'Keep migrating' ) }
									</Button>
									<Button
										variant="primary"
										isBusy={ cancel.isPending }
										disabled={ cancel.isPending || isFetching }
										onClick={ () => cancel.mutate() }
									>
										{ __( 'Cancel migration' ) }
									</Button>
								</>
							) }
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</>
	);
}
