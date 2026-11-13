import { DomainSubtype } from '@automattic/api-core';
import { domainQuery, disconnectDomainMutation, purchaseQuery } from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useState } from 'react';
import { domainRoute, domainTransferRoute } from '../../app/router/domains';
import { cancelPurchaseRoute } from '../../app/router/me';
import { ActionList } from '../../components/action-list';
import InlineSupportLink from '../../components/inline-support-link';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import {
	shouldShowTransferAction,
	shouldShowDisconnectAction,
	shouldShowRemoveAction,
	shouldShowCancelAction,
	getDeleteTitle,
	getDeleteLabel,
	getDeleteDescription,
} from './actions.utils';
import { useTrackOverviewItem } from './use-track-overview-item';
import type { SnackbarBackTo } from '../../app/snackbar-back-button';

export default function Actions( { isDisabled }: { isDisabled?: boolean } ) {
	const { domainName } = domainRoute.useParams();
	const { back_to: domainBackTo } = useSearch( { strict: false } ) as {
		back_to?: SnackbarBackTo;
	};
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const trackItem = useTrackOverviewItem( domain );
	const { data: purchase } = useQuery( {
		...purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) ),
		enabled: !! domain.subscription_id,
	} );
	const { mutate: disconnectDomain, isPending: isDisconnecting } = useMutation(
		disconnectDomainMutation( domainName )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isDisconnectDialogOpen, setIsDisconnectDialogOpen ] = useState( false );

	const onDisconnectConfirm = useCallback(
		() =>
			disconnectDomain( undefined, {
				onSuccess: () =>
					createSuccessNotice(
						__( 'The domain will be detached from this site in a few minutes.' ),
						{
							type: 'snackbar',
						}
					),
				onError: ( e: Error ) => createErrorNotice( e.message, { type: 'snackbar' } ),
				onSettled: () => {
					setIsDisconnectDialogOpen( false );
				},
			} ),
		[ disconnectDomain, createSuccessNotice, createErrorNotice ]
	);

	const availableActions = {
		transfer: shouldShowTransferAction( domain ),
		disconnect: shouldShowDisconnectAction( domain ),
		remove: shouldShowRemoveAction( domain, purchase ),
		cancel: shouldShowCancelAction( domain, purchase ),
	};

	const cancelPurchaseSearch = {
		back_to: 'domain' as const,
		...( domainBackTo === 'site-overview' || domainBackTo === 'site-domains'
			? { domain_back_to: domainBackTo }
			: {} ),
	};

	// If none of the actions are available, don't render the actions section
	if ( Object.values( availableActions ).every( ( action ) => ! action ) ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 3 } title={ __( 'Danger zone' ) } />
			<ActionList>
				{ availableActions.transfer && (
					<ActionList.ActionItem
						title={ __( 'Transfer' ) }
						description={
							domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
								? __( 'Transfer this domain connection to another site or WordPress.com user.' )
								: __( 'Transfer this domain to another site or WordPress.com user.' )
						}
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								to={ domainTransferRoute.fullPath }
								onClick={ () => trackItem( 'action-transfer' ) }
								params={ { domainName } }
								disabled={ isDisabled }
							>
								{ __( 'Transfer' ) }
							</RouterLinkButton>
						}
					/>
				) }
				{ availableActions.disconnect && (
					<ActionList.ActionItem
						title={ __( 'Detach' ) }
						description={ sprintf(
							/* translators: %s is the site slug, e.g. "mysite.wordpress.com" */
							__( 'Detach this domain from %s.' ),
							domain.site_slug
						) }
						actions={
							<Button
								size="compact"
								variant="secondary"
								isBusy={ isDisconnecting }
								disabled={ isDisconnecting }
								onClick={ () => {
									trackItem( 'action-disconnect' );
									setIsDisconnectDialogOpen( true );
								} }
							>
								{ __( 'Detach' ) }
							</Button>
						}
					/>
				) }
				{ availableActions.remove && purchase && (
					<ActionList.ActionItem
						title={ getDeleteTitle( domain ) }
						description={ getDeleteDescription( domain ) }
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								isDestructive
								to={ cancelPurchaseRoute.fullPath }
								onClick={ () => trackItem( 'action-remove' ) }
								params={ { purchaseId: purchase.ID } }
								search={ { intent: 'remove', ...cancelPurchaseSearch } }
							>
								{ getDeleteLabel( domain ) }
							</RouterLinkButton>
						}
					/>
				) }
				{ availableActions.cancel && purchase && (
					<ActionList.ActionItem
						title={ getDeleteTitle( domain ) }
						description={ getDeleteDescription( domain ) }
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								isDestructive
								to={ cancelPurchaseRoute.fullPath }
								onClick={ () => trackItem( 'action-cancel' ) }
								params={ { purchaseId: purchase.ID } }
								search={ cancelPurchaseSearch }
							>
								{ getDeleteLabel( domain ) }
							</RouterLinkButton>
						}
					/>
				) }
			</ActionList>

			<ConfirmDialog
				isOpen={ isDisconnectDialogOpen }
				confirmButtonText={ __( 'Detach' ) }
				onCancel={ () => setIsDisconnectDialogOpen( false ) }
				onConfirm={ onDisconnectConfirm }
			>
				<SectionHeader
					title={ sprintf(
						/* translators: %s is the domain name */
						__( 'Detach %s' ),
						domainName
					) }
					description={ createInterpolateElement(
						sprintf(
							/* translators: %s is the site slug, e.g. "mysite.wordpress.com" */
							__( 'Are you sure you want to detach this domain from %s? <learnMoreLink />' ),
							domain.site_slug
						),
						{
							learnMoreLink: (
								<InlineSupportLink
									onClick={ () => setIsDisconnectDialogOpen( false ) }
									supportContext="domain-detach-from-site"
								/>
							),
						}
					) }
				/>
			</ConfirmDialog>
		</VStack>
	);
}
