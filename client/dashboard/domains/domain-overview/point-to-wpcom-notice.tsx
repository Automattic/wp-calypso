import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { domainPointToWpcomMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';

export default function PointToWpcomNotice( { domain }: { domain: Domain } ) {
	const { domain: domainName, current_user_is_owner, owner } = domain;
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const pointToWpcom = useMutation(
		withSnackbar( domainPointToWpcomMutation( domainName ), {
			success: __( 'Domain pointed to WordPress.com.' ),
			error: { source: 'server' },
		} )
	);

	const isCompletedTransferNotPointingToWpcom =
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		domain.transfer_status === DomainTransferStatus.COMPLETED &&
		! domain.points_to_wpcom;

	if ( ! isCompletedTransferNotPointingToWpcom ) {
		return null;
	}

	const onConfirm = () => {
		setIsDialogOpen( false );
		recordTracksEvent( 'calypso_dashboard_domains_point_to_wpcom', {
			domain_name: domainName,
		} );

		pointToWpcom.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domains_point_to_wpcom_success', {
					domain_name: domainName,
				} );
			},
			onError: ( error ) => {
				recordTracksEvent( 'calypso_dashboard_domains_point_to_wpcom_error', {
					domain_name: domainName,
					error_message: error.message,
				} );
			},
		} );
	};

	return (
		<>
			<Notice
				variant="warning"
				title={ __( 'Transfer completed' ) }
				actions={
					current_user_is_owner ? (
						<Button
							variant="primary"
							onClick={ () => setIsDialogOpen( true ) }
							disabled={ pointToWpcom.isPending }
							isBusy={ pointToWpcom.isPending }
						>
							{ __( 'Point to WordPress.com' ) }
						</Button>
					) : undefined
				}
			>
				<Text as="p">
					{ __(
						'Your domain transfer is complete, but the domain is not pointing to WordPress.com yet. Point it to WordPress.com to make it work with your site.'
					) }
				</Text>
				{ ! current_user_is_owner && (
					<Text as="p">
						{ createInterpolateElement(
							/* translators: <owner/> is the domain owner */
							__( 'Please contact the domain owner, <owner/>, to point it to WordPress.com.' ),
							{
								owner: <strong>{ owner }</strong>,
							}
						) }
					</Text>
				) }
			</Notice>

			<ConfirmDialog
				isOpen={ isDialogOpen }
				confirmButtonText={ __( 'Continue' ) }
				cancelButtonText={ __( 'Cancel' ) }
				onCancel={ () => setIsDialogOpen( false ) }
				onConfirm={ onConfirm }
			>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Point to WordPress.com' ) }
						description={ __( 'When you point your domain to WordPress.com, we will:' ) }
					/>
					<ul>
						<li>{ __( 'Change your name servers to use the WordPress.com defaults.' ) }</li>
						<li>{ __( 'Reset to default A records.' ) }</li>
						<li>{ __( 'Set the default ‘www’ CNAME records.' ) }</li>
					</ul>
					<Text as="p">
						{ __( 'Please note that these changes may take some time to apply.' ) }
					</Text>
				</VStack>
			</ConfirmDialog>
		</>
	);
}
