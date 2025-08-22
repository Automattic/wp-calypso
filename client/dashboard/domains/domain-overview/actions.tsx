import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useState } from 'react';
import { useAuth } from '../../app/auth';
import { domainQuery, disconnectDomainMutation } from '../../app/queries/domain';
import { siteByIdQuery } from '../../app/queries/site';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { domainRoute, domainTransferRoute } from '../../app/router/domains';
import { ActionList } from '../../components/action-list';
import RemoveDomainDialog from '../../components/purchase-dialogs/remove-domain-dialog';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { getDomainRenewalUrl } from '../../utils/domain';
import {
	shouldShowTransferAction,
	shouldShowDisconnectAction,
	shouldShowDeleteAction,
	getDeleteTitle,
	getDeleteLabel,
	getDeleteDescription,
} from './actions.utils';

export default function Actions() {
	const { user } = useAuth();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );
	const { data: purchase } = useQuery(
		sitePurchaseQuery( domain.blog_id, parseInt( domain.subscription_id, 10 ) )
	);
	const { mutate: disconnectDomain, isPending: isDisconnecting } = useMutation(
		disconnectDomainMutation( domainName )
	);
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
			} ),
		[ disconnectDomain, createSuccessNotice, createErrorNotice ]
	);

	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 3 } title={ __( 'Actions' ) } />
			<ActionList>
				{ purchase?.is_renewable && (
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
				{ shouldShowTransferAction( domain ) && (
					<ActionList.ActionItem
						title={ __( 'Transfer' ) }
						description={ __( 'Transfer this domain to another site or WordPress.com user.' ) }
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
				{ shouldShowDisconnectAction( domain ) && (
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
				{ shouldShowDeleteAction( domain, purchase, site ) && (
					<ActionList.ActionItem
						title={ getDeleteTitle( domain ) }
						description={ getDeleteDescription( domain ) }
						actions={
							<Button
								size="compact"
								variant="secondary"
								isDestructive
								onClick={ () => setIsDeleteDialogOpen( true ) }
							>
								{ getDeleteLabel( domain ) }
							</Button>
						}
					/>
				) }
			</ActionList>

			{ isDisconnectDialogOpen && (
				<ConfirmDialog
					onConfirm={ onDisconnectConfirm }
					onCancel={ () => setIsDisconnectDialogOpen( false ) }
					confirmButtonText={ __( 'Detach' ) }
				>
					{ __( 'Are you sure you want to detach this domain?' ) }
				</ConfirmDialog>
			) }

			<RemoveDomainDialog
				user={ user }
				domain={ domain }
				isOpen={ isDeleteDialogOpen }
				closeDialog={ () => setIsDeleteDialogOpen( false ) }
				removeDomain={ () => setIsDeleteDialogOpen( false ) }
				onCancel={ () => setIsDeleteDialogOpen( false ) }
			/>
		</VStack>
	);
}
