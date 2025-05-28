import { __experimentalHeading as Heading, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SiteLeaveModal from '../site-leave-modal';
import SiteDeleteModal from '../site-delete-modal';
import type { Site } from '../../data/types';

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

const SiteLeaveAction = ( { site }: { site: Site } ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Leave site' ) }
				description={ __( 'Leave this site and remove your access.' ) }
				actions={
					<Button variant="secondary" size="compact" onClick={ () => setIsModalOpen( true ) }>
						{ __( 'Leave' ) }
					</Button>
				}
			/>
			{ isModalOpen && <SiteLeaveModal site={ site } onClose={ () => setIsModalOpen( false ) } /> }
		</>
	);
}

const canDeleteSite = ( site: Site ) =>
	( site.is_wpcom_atomic || ! site.jetpack ) && ! site.is_vip && ! site.options?.p2_hub_blog_id;

const SiteDeleteAction = ( { site }: { site: Site } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Delete site' ) }
				description={ __(
					"Delete all your posts, pages, media, and data, and give up your site's address."
				) }
				actions={
					<Button
						variant="secondary"
						size="compact"
						isDestructive
						onClick={ () => setIsOpen( true ) }
					>
						{ __( 'Delete' ) }
					</Button>
				}
			/>
			{ isOpen && <SiteDeleteModal site={ site } onClose={ () => setIsOpen( false ) } /> }
		</>
	);
};

export default function DangerZone( { site }: { site: Site } ) {
	const canTransferSite = useCanTransferSite( { site } );

	const actions = [
		canTransferSite && <SiteTransferAction key="transfer-site" site={ site } />,
		<SiteLeaveAction key="leave-site" site={ site } />,
		canDeleteSite( site ) && <SiteDeleteAction key="delete-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<>
			<Heading>{ __( 'Danger zone' ) }</Heading>
			<ActionList>{ actions }</ActionList>
		</>
	);
}
