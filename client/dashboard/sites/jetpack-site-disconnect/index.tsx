import { sitePurchasesQuery, siteJetpackDisconnectMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { purchaseSettingsRoute, purchasesRoute } from '../../app/router/me';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Site } from '@automattic/api-core';

interface JetpackSiteDisconnectProps {
	site: Site;
	onClose: () => void;
}

type DisconnectFormData = {
	domain: string;
};

function PurchasesWarning( {
	site,
	activePurchaseIds,
}: {
	site: Site;
	activePurchaseIds: number[];
} ) {
	const { recordTracksEvent } = useAnalytics();
	const hasSinglePurchase = activePurchaseIds.length === 1;

	const onLinkClick = () => {
		recordTracksEvent( 'calypso_dashboard_site_disconnect_modal_manage_purchases_click' );
	};

	const message = _n(
		'This site has an active Jetpack subscription that will continue to be billed after disconnecting. <link>Manage subscription</link>.',
		'This site has active Jetpack subscriptions that will continue to be billed after disconnecting. <link>Manage subscriptions</link>.',
		activePurchaseIds.length
	);

	let link;
	if ( hasSinglePurchase ) {
		link = isDashboardBackport() ? (
			<Button
				variant="link"
				href={ `/me/purchases/${ site.slug }/${ activePurchaseIds[ 0 ] }` }
				onClick={ onLinkClick }
			/>
		) : (
			<RouterLinkButton
				variant="link"
				to={ purchaseSettingsRoute.fullPath }
				params={ { purchaseId: String( activePurchaseIds[ 0 ] ) } }
				onClick={ onLinkClick }
			/>
		);
	} else {
		link = isDashboardBackport() ? (
			<Button
				variant="link"
				href={ `/me/purchases?purchaseSiteFilter=${ site.ID }` }
				onClick={ onLinkClick }
			/>
		) : (
			<RouterLinkButton
				variant="link"
				to={ purchasesRoute.fullPath }
				search={ { site: site.ID } }
				onClick={ onLinkClick }
			/>
		);
	}

	return (
		<Notice variant="warning" density="medium">
			<Text>{ createInterpolateElement( message, { link } ) }</Text>
		</Notice>
	);
}

function ContentConfirmDisconnect( {
	site,
	onClose,
	activePurchaseIds,
}: JetpackSiteDisconnectProps & { activePurchaseIds: number[] } ) {
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
				{ activePurchaseIds.length > 0 && (
					<PurchasesWarning site={ site } activePurchaseIds={ activePurchaseIds } />
				) }
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

export default function JetpackSiteDisconnect( { site, onClose }: JetpackSiteDisconnectProps ) {
	const { data: activePurchaseIds, isLoading } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( purchases ) =>
			purchases
				.filter(
					( purchase ) =>
						purchase.is_jetpack_plan_or_product && purchase.subscription_status === 'active'
				)
				.map( ( purchase ) => purchase.ID ),
	} );

	if ( isLoading ) {
		return null;
	}

	return (
		<ContentConfirmDisconnect
			site={ site }
			onClose={ onClose }
			activePurchaseIds={ activePurchaseIds ?? [] }
		/>
	);
}
