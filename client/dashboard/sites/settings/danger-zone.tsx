import { siteHasCancelablePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { canTransferSite, canLeaveSite, canResetSite } from '../features';
import SiteDeleteModal from '../site-delete-modal';
import SiteLeaveModal from '../site-leave-modal';
import SiteResetModal from '../site-reset-modal';
import StagingSiteDeleteModal from '../staging-site-delete-modal';
import type { Site } from '@automattic/api-core';

const SiteTransferAction = ( { site }: { site: Site } ) => {
	const { slug } = site;

	return (
		<ActionList.ActionItem
			title={ __( 'Transfer site' ) }
			description={ __( 'Transfer ownership of this site to another WordPress.com user.' ) }
			actions={
				<RouterLinkButton
					variant="secondary"
					size="compact"
					to={ `/sites/${ slug }/settings/transfer-site` }
				>
					{ __( 'Transfer' ) }
				</RouterLinkButton>
			}
		/>
	);
};

const SiteResetAction = ( { site }: { site: Site } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Reset site' ) }
				description={ __( 'Restore this site to its original state.' ) }
				actions={
					<Button variant="secondary" size="compact" onClick={ () => setIsOpen( true ) }>
						{ __( 'Reset' ) }
					</Button>
				}
			/>
			{ isOpen && <SiteResetModal site={ site } onClose={ () => setIsOpen( false ) } /> }
		</>
	);
};

const SiteLeaveAction = ( { site }: { site: Site } ) => {
	const { user } = useAuth();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const { data: hasPurchasesCancelable, isLoading } = useQuery( {
		...siteHasCancelablePurchasesQuery( site.ID, user.ID ),
		enabled: isModalOpen,
	} );

	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Leave site' ) }
				description={ __( 'Leave this site and remove your access.' ) }
				actions={
					<Button
						variant="secondary"
						size="compact"
						isBusy={ isModalOpen && isLoading }
						disabled={ isModalOpen && isLoading }
						onClick={ () => setIsModalOpen( true ) }
					>
						{ __( 'Leave' ) }
					</Button>
				}
			/>
			{ isModalOpen && hasPurchasesCancelable !== undefined && (
				<SiteLeaveModal
					site={ site }
					hasPurchasesCancelable={ hasPurchasesCancelable }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
};

const SiteDeleteAction = ( { site }: { site: Site } ) => {
	const { user } = useAuth();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const { data: hasPurchasesCancelable, isLoading } = useQuery( {
		...siteHasCancelablePurchasesQuery( site.ID, user.ID ),
		enabled: isModalOpen,
	} );

	const deleteButton = (
		<Button
			variant="secondary"
			size="compact"
			isDestructive
			isBusy={ isModalOpen && isLoading }
			disabled={ isModalOpen && isLoading }
			onClick={ () => setIsModalOpen( true ) }
		>
			{ __( 'Delete' ) }
		</Button>
	);

	if ( site.is_wpcom_staging_site ) {
		return (
			<>
				<ActionList.ActionItem
					title={ __( 'Delete staging site' ) }
					description={ __( 'Delete staging site and all of its posts, media, and data.' ) }
					actions={ deleteButton }
				/>
				{ isModalOpen && (
					<StagingSiteDeleteModal site={ site } onClose={ () => setIsModalOpen( false ) } />
				) }
			</>
		);
	}

	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Delete site' ) }
				description={ __(
					'Delete all your posts, pages, media, and data, and give up your site’s address.'
				) }
				actions={ deleteButton }
			/>
			{ isModalOpen && hasPurchasesCancelable !== undefined && (
				<SiteDeleteModal
					site={ site }
					hasPurchasesCancelable={ hasPurchasesCancelable }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
};

export default function DangerZone( { site }: { site: Site } ) {
	const { user } = useAuth();

	const actions = [
		canTransferSite( site, user ) && <SiteTransferAction key="transfer-site" site={ site } />,
		canLeaveSite( site ) && <SiteLeaveAction key="leave-site" site={ site } />,
		canResetSite( site ) && <SiteResetAction key="reset-site" site={ site } />,
		<SiteDeleteAction key="delete-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Danger zone' ) } level={ 3 } />
			<ActionList>{ actions }</ActionList>
		</VStack>
	);
}
