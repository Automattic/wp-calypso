import { DomainSubtype } from '@automattic/api-core';
import {
	domainQuery,
	disconnectDomainMutation,
	removePurchaseMutation,
	purchaseQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
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
import { useAuth } from '../../app/auth';
import { domainRoute, domainsIndexRoute, domainTransferRoute } from '../../app/router/domains';
import { purchaseSettingsRoute, cancelPurchaseRoute } from '../../app/router/me';
import { ActionList } from '../../components/action-list';
import InlineSupportLink from '../../components/inline-support-link';
import RemoveDomainDialog from '../../components/purchase-dialogs/remove-domain-dialog';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { getDomainRenewalUrl } from '../../utils/domain';
import {
	shouldShowTransferAction,
	shouldShowTransferInAction,
	shouldShowDisconnectAction,
	shouldShowRemoveAction,
	shouldShowCancelAction,
	getDeleteTitle,
	getDeleteLabel,
	getDeleteDescription,
} from './actions.utils';

export default function Actions() {
	const router = useRouter();
	const { user } = useAuth();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: purchase } = useSuspenseQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
	);
	const { mutate: disconnectDomain, isPending: isDisconnecting } = useMutation(
		disconnectDomainMutation( domainName )
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { mutate: deleteDomain, isPending: isDeleting } = useMutation( removePurchaseMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isDisconnectDialogOpen, setIsDisconnectDialogOpen ] = useState( false );
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );

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

	const onDeleteConfirm = useCallback(
		() =>
			purchase &&
			deleteDomain( purchase.ID, {
				onSuccess: () => {
					createSuccessNotice( __( 'The domain deletion has been completed.' ), {
						type: 'snackbar',
					} );
					router.navigate( { to: domainsIndexRoute.fullPath } );
				},
				onError: ( e: Error ) => createErrorNotice( e.message, { type: 'snackbar' } ),
				onSettled: () => {
					setIsDeleteDialogOpen( false );
				},
			} ),
		[ purchase, deleteDomain, createSuccessNotice, createErrorNotice, router ]
	);

	const availableActions = {
		renew: purchase.is_renewable && domain.current_user_is_owner,
		transfer: shouldShowTransferAction( domain ),
		transferIn: shouldShowTransferInAction( domain ),
		disconnect: shouldShowDisconnectAction( domain ),
		remove: shouldShowRemoveAction( domain, purchase ),
		cancel: shouldShowCancelAction( domain, purchase ),
	};

	// If none of the actions are available, don't render the actions section
	if ( Object.values( availableActions ).every( ( action ) => ! action ) ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 3 } title={ __( 'Actions' ) } />
			<ActionList>
				{ availableActions.renew && (
					<ActionList.ActionItem
						title={ __( 'Renew' ) }
						description={ __( 'Renew domain registration.' ) }
						actions={
							<Button
								size="compact"
								variant="secondary"
								href={ getDomainRenewalUrl( domain, purchase ) }
							>
								{ __( 'Renew' ) }
							</Button>
						}
					/>
				) }
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
								params={ { domainName } }
							>
								{ __( 'Transfer' ) }
							</RouterLinkButton>
						}
					/>
				) }
				{ availableActions.transferIn && (
					<ActionList.ActionItem
						title={ __( 'Bring your domain to WordPress.com' ) }
						description={ __( 'Manage your site and domain all in one place.' ) }
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								// TODO: use the correct route once the domain transfer in route is created
								to={ domainTransferRoute.fullPath }
								params={ { domainName } }
							>
								{ __( 'Transfer' ) }
							</RouterLinkButton>
						}
					/>
				) }
				{ availableActions.disconnect && (
					<ActionList.ActionItem
						title={ __( 'Detach' ) }
						description={ __( 'Detach this domain from the site.' ) }
						actions={
							<Button
								size="compact"
								variant="secondary"
								isBusy={ isDisconnecting }
								disabled={ isDisconnecting }
								onClick={ () => setIsDisconnectDialogOpen( true ) }
							>
								{ __( 'Detach' ) }
							</Button>
						}
					/>
				) }
				{ availableActions.remove && (
					<ActionList.ActionItem
						title={ getDeleteTitle( domain ) }
						description={ getDeleteDescription( domain ) }
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								isDestructive
								to={ purchaseSettingsRoute.fullPath }
								params={ { purchaseId: purchase.ID } }
							>
								{ getDeleteLabel( domain ) }
							</RouterLinkButton>
						}
					/>
				) }
				{ availableActions.cancel && (
					<ActionList.ActionItem
						title={ getDeleteTitle( domain ) }
						description={ getDeleteDescription( domain ) }
						actions={
							<RouterLinkButton
								size="compact"
								variant="secondary"
								isDestructive
								to={ cancelPurchaseRoute.fullPath }
								params={ { purchaseId: purchase.ID } }
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
						__( 'Detach domain %s' ),
						domainName
					) }
					description={ createInterpolateElement(
						__( 'Are you sure you want to detach this domain? <learnMoreLink />' ),
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

			<RemoveDomainDialog
				isOpen={ isDeleteDialogOpen }
				user={ user }
				domain={ domain }
				closeDialog={ () => setIsDeleteDialogOpen( false ) }
				onConfirm={ onDeleteConfirm }
			/>
		</VStack>
	);
}
