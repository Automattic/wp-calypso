import { sitePurchasesQuery, siteJetpackDisconnectMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
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
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Site } from '@automattic/api-core';

interface ContentInfoProps {
	site: Site;
	onClose: () => void;
}

type DisconnectFormData = {
	domain: string;
};

function PurchasesWarning( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<Notice variant="warning" density="medium">
			<Text>
				{ createInterpolateElement(
					__(
						'You have active subscriptions associated with this site. Before disconnecting, consider <link>managing your purchases</link>.'
					),
					{
						link: isDashboardBackport() ? (
							<Button
								variant="link"
								href={ `/purchases/subscriptions/${ site.slug }` }
								onClick={ () => {
									recordTracksEvent(
										'calypso_dashboard_site_disconnect_modal_manage_purchases_click'
									);
								} }
							/>
						) : (
							<RouterLinkButton
								variant="link"
								to={ purchasesRoute.fullPath }
								search={ { site: site.ID } }
								onClick={ () => {
									recordTracksEvent(
										'calypso_dashboard_site_disconnect_modal_manage_purchases_click'
									);
								} }
							/>
						),
					}
				) }
			</Text>
		</Notice>
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
		domain: '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( formData.domain !== site.slug ) {
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
						__(
							'Disconnecting <siteDomain /> will remove the Jetpack connection between this site and WordPress.com. You will lose access to Jetpack features like <link>backups, security, and stats</link>.'
						),
						{
							siteDomain: <strong>{ site.slug }</strong>,
							link: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								<ExternalLink href="https://jetpack.com/support/why-the-wordpress-com-connection-is-important-for-jetpack/" />
							),
						}
					) }
				</Text>
				<DataForm< DisconnectFormData >
					data={ formData }
					fields={ [
						{
							id: 'domain',
							label: __( 'Type the site domain to confirm' ),
							type: 'text' as const,
							description: sprintf(
								/* translators: %s: site domain */
								__( 'The site domain is: %s' ),
								site.slug
							),
						},
					] }
					form={ { layout: { type: 'regular' as const }, fields: [ 'domain' ] } }
					onChange={ ( edits: Partial< DisconnectFormData > ) => {
						setFormData( ( data ) => ( {
							...data,
							...edits,
							domain: edits.domain?.trim() ?? data.domain,
						} ) );
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
						disabled={ formData.domain !== site.slug }
						isBusy={ mutation.isPending }
					>
						{ __( 'Disconnect site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default function JetpackSiteDisconnect( { site, onClose }: ContentInfoProps ) {
	const { data: hasActivePurchases, isLoading } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( purchases ) =>
			purchases.some(
				( purchase ) =>
					purchase.is_jetpack_plan_or_product && purchase.subscription_status === 'active'
			),
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
