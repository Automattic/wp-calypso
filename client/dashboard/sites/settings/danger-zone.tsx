import { __experimentalHeading as Heading, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SiteLeaveModal from '../site-leave-modal';
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
};

export default function DangerZone( { site }: { site: Site } ) {
	const canTransferSite = useCanTransferSite( { site } );

	const actions = [
		canTransferSite && <SiteTransferAction key="transfer-site" site={ site } />,
		<SiteLeaveAction key="leave-site" site={ site } />,
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
