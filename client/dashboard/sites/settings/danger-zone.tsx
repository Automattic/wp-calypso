import config from '@automattic/calypso-config';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { canViewSiteActions, canTransferSite } from '../features';
import SiteDeleteModal from '../site-delete-modal';
import SiteLeaveModal from '../site-leave-modal';
import SiteResetModal from '../site-reset-modal';
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

const SiteDeleteAction = ( { site }: { site: Site } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<ActionList.ActionItem
				title={ site.is_wpcom_staging_site ? __( 'Delete staging site' ) : __( 'Delete site' ) }
				description={
					site.is_wpcom_staging_site
						? __( 'Delete staging site and all of its posts, media, and data.' )
						: __(
								'Delete all your posts, pages, media, and data, and give up your site’s address.'
						  )
				}
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
	const { user } = useAuth();
	const isStagingRedesignEnabled = config.isEnabled( 'hosting/staging-sites-redesign' );

	// For staging sites, only show the danger zone if the redesign feature flag is enabled
	if ( site.is_wpcom_staging_site ) {
		if ( ! isStagingRedesignEnabled ) {
			return null;
		}

		// For staging sites, only show the delete action
		return (
			<VStack spacing={ 3 }>
				<SectionHeader title={ __( 'Danger zone' ) } level={ 3 } />
				<ActionList>
					<SiteDeleteAction key="delete-site" site={ site } />
				</ActionList>
			</VStack>
		);
	}

	// For non-staging sites, use the existing logic
	if ( ! canViewSiteActions( site ) ) {
		return null;
	}

	const actions = [
		canTransferSite( site, user ) && <SiteTransferAction key="transfer-site" site={ site } />,
		<SiteLeaveAction key="leave-site" site={ site } />,
		<SiteResetAction key="reset-site" site={ site } />,
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
