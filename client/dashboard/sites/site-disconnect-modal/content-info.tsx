import { sitePurchasesQuery, siteJetpackDisconnectMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { purchasesRoute } from '../../app/router/me';
import { ButtonStack } from '../../components/button-stack';
import RouterLinkButton from '../../components/router-link-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Site } from '@automattic/api-core';

interface ContentInfoProps {
	site: Site;
	onClose: () => void;
}

type DisconnectFormData = {
	confirmed: boolean;
};

function PurchasesWarning( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();

	const managePurchasesButtonProps = {
		__next40pxDefaultSize: true,
		text: __( 'Manage purchases' ),
		variant: 'secondary' as const,
		onClick: () => {
			recordTracksEvent( 'calypso_dashboard_site_disconnect_modal_manage_purchases_click' );
		},
	};

	return (
		<VStack spacing={ 4 }>
			<Text as="p">
				{ __(
					'You have active subscriptions associated with this site. Before disconnecting, you may want to cancel or move them to another site.'
				) }
			</Text>
			{ isDashboardBackport() ? (
				<Button
					{ ...managePurchasesButtonProps }
					href={ `/purchases/subscriptions/${ site.slug }` }
				/>
			) : (
				<RouterLinkButton
					{ ...managePurchasesButtonProps }
					to={ purchasesRoute.fullPath }
					search={ { site: site.ID } }
				/>
			) }
		</VStack>
	);
}

function ContentConfirmDisconnect( {
	site,
	onClose,
	hasActivePurchases,
}: ContentInfoProps & { hasActivePurchases: boolean } ) {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( siteJetpackDisconnectMutation( site.ID ) );

	const [ formData, setFormData ] = useState< DisconnectFormData >( {
		confirmed: false,
	} );

	const isConfirmed = formData.confirmed;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! isConfirmed ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_site_disconnect_modal_disconnect_click' );

		mutation.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_site_disconnect_modal_disconnect_success' );
				createSuccessNotice(
					sprintf(
						/* translators: %s: site domain */
						__( '%s has been disconnected.' ),
						site.slug
					),
					{ type: 'snackbar' }
				);

				router.navigate( { to: '/sites' } );
				onClose();
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_dashboard_site_disconnect_modal_disconnect_error', {
					site_id: site.ID,
					error: error.name,
				} );

				createErrorNotice( error.message || __( 'Failed to disconnect site.' ), {
					type: 'snackbar',
				} );
				onClose();
			},
		} );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 6 }>
				{ hasActivePurchases && <PurchasesWarning site={ site } /> }
				<Text as="p">
					{ createInterpolateElement(
						/* translators: <siteDomain />: site domain */
						__( 'Are you sure you want to disconnect <siteDomain />?' ),
						{
							siteDomain: <strong>{ site.slug }</strong>,
						}
					) }
				</Text>
				<Text as="p">
					{ __(
						'Disconnecting will remove the Jetpack connection between this site and WordPress.com. You will lose access to Jetpack features like backups, security, and stats.'
					) }
				</Text>
				<DataForm< DisconnectFormData >
					data={ formData }
					fields={ [
						{
							id: 'confirmed',
							label: __( 'I understand the consequences of disconnecting' ),
							Edit: 'checkbox',
						},
					] }
					form={ { layout: { type: 'regular' as const }, fields: [ 'confirmed' ] } }
					onChange={ ( edits: Partial< DisconnectFormData > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>
				<ButtonStack justify="flex-end" expanded={ false }>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						isDestructive
						disabled={ ! isConfirmed }
						isBusy={ mutation.isPending }
					>
						{ __( 'Disconnect site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default function ContentInfo( { site, onClose }: ContentInfoProps ) {
	const { data: hasActivePurchases, isLoading } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( purchases ) => purchases.some( ( purchase ) => purchase.is_jetpack_plan_or_product ),
	} );

	if ( isLoading ) {
		return null;
	}

	return (
		<ContentConfirmDisconnect
			site={ site }
			onClose={ onClose }
			hasActivePurchases={ !! hasActivePurchases }
		/>
	);
}
