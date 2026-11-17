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
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import { SiteResetContent } from '../../site-reset-modal';
import type { Site } from '@automattic/api-core';

export function MigrationCancellation( {
	site,
	recovering = false,
}: {
	site: Site;
	recovering?: boolean;
} ) {
	const queryClient = useQueryClient();
	const { setShowHelpCenter } = useHelpCenter();
	const [ isOpen, setIsOpen ] = useState( false );
	const { data, error, isFetching, refetch } = useQuery( {
		...siteWordPressMigrationCancellationQuery( site.ID ),
		enabled: isOpen || recovering,
		retry: false,
		refetchOnMount: 'always',
		refetchInterval: ( { state } ) =>
			state.data?.status === 'resetting' || ( recovering && state.error ) ? 5000 : false,
	} );
	const cancel = useMutation( siteWordPressMigrationCancelMutation( site.ID ) );
	const domain = new URL( site.URL ).hostname;
	const isResetting = data?.status === 'resetting';

	useEffect( () => {
		if ( data?.status === 'cancelled' ) {
			queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		}
	}, [ data?.status, queryClient, site.ID ] );

	const onClose = () => {
		if ( ! cancel.isPending ) {
			setIsOpen( false );
			cancel.reset();
		}
	};

	const feedback = ( error || cancel.error ) && (
		<Notice
			variant="error"
			actions={
				<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
					{ __( 'Contact us' ) }
				</Button>
			}
		>
			{ __( 'We couldn’t cancel the migration. Please try again or contact support.' ) }
		</Notice>
	);

	return (
		<>
			{ recovering ? (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<Text weight={ 500 }>
								{ data?.status === 'failed'
									? __( 'The site reset failed' )
									: __( 'Resetting your site' ) }
							</Text>
							<Text>
								{ data?.status === 'failed'
									? __(
											'Your migration is still cancelled. Try resetting the site again, or contact support.'
										)
									: __( 'We’ll open your site dashboard once the reset has finished.' ) }
							</Text>
							{ feedback }
							{ data?.status === 'failed' && (
								<Button variant="secondary" onClick={ () => setIsOpen( true ) }>
									{ __( 'Try resetting again' ) }
								</Button>
							) }
							{ error && (
								<Button variant="secondary" onClick={ () => refetch() }>
									{ __( 'Try again' ) }
								</Button>
							) }
						</VStack>
					</CardBody>
				</Card>
			) : (
				<Button
					variant="link"
					className="wordpress-migration__note-link"
					onClick={ () => setIsOpen( true ) }
				>
					{ __( 'Cancel this migration' ) }
				</Button>
			) }
			{ isOpen && (
				<Modal
					title={
						data?.requires_reset
							? __( 'Cancel migration and reset site' )
							: __( 'Cancel migration' )
					}
					onRequestClose={ onClose }
					isDismissible={ ! cancel.isPending }
					shouldCloseOnClickOutside={ ! cancel.isPending }
					size="medium"
				>
					<VStack spacing={ 6 }>
						{ feedback }
						{ ! data && ! error && <Spinner /> }
						{ error && (
							<Button variant="secondary" onClick={ () => refetch() } disabled={ isFetching }>
								{ __( 'Try again' ) }
							</Button>
						) }
						{ isResetting && (
							<Text>
								{ __( 'We’re resetting your site. You can close this window while you wait.' ) }
							</Text>
						) }
						{ data &&
							! error &&
							! isResetting &&
							data.status !== 'cancelled' &&
							( data.requires_reset ? (
								<>
									<Text>
										{ __(
											'This migration may have changed your destination site. Cancelling requires a reset, which removes all destination content, including anything that was there before the migration. Your plan and domain stay active.'
										) }
									</Text>
									<SiteResetContent
										siteDomain={ domain }
										isBusy={ cancel.isPending }
										onClose={ onClose }
										onSubmit={ ( confirmedDomain ) =>
											cancel.mutate( { reset: true, domain: confirmedDomain } )
										}
									/>
								</>
							) : (
								<>
									<Text>
										{ __(
											'Cancel this migration and return to your site dashboard? Your plan and domain stay active.'
										) }
									</Text>
									<ButtonStack justify="flex-end">
										<Button variant="tertiary" disabled={ cancel.isPending } onClick={ onClose }>
											{ __( 'Keep migrating' ) }
										</Button>
										<Button
											variant="primary"
											isBusy={ cancel.isPending }
											disabled={ cancel.isPending || isFetching }
											onClick={ () => cancel.mutate( { reset: false } ) }
										>
											{ __( 'Cancel migration' ) }
										</Button>
									</ButtonStack>
								</>
							) ) }
					</VStack>
				</Modal>
			) }
		</>
	);
}
