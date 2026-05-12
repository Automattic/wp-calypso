import {
	__experimentalHStack as HStack,
	MenuGroup,
	MenuItem,
	Icon,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import AddNewSite from '../add-new-site';
import { useAiSiteBuilderPath } from '../use-ai-site-builder-path';
import { SiteSwitcherBase } from './base';
import type { SiteSwitcherProps } from './types';

const SiteSwitcher = ( props: SiteSwitcherProps ) => {
	const { recordTracksEvent } = useAnalytics();
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
	// Hoisted out of the modal so the ExPlat assignment is fetched on mount
	// rather than when the popover opens.
	const aiSiteBuilderPath = useAiSiteBuilderPath();

	return (
		<>
			<SiteSwitcherBase { ...props }>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								recordTracksEvent( 'calypso_dashboard_site_switcher_add_new_site_click' );
								onClose();
								setIsAddSiteModalOpen( true );
							} }
						>
							<HStack justify="flex-start" alignment="center">
								<Icon icon={ plus } />
								<span>{ __( 'Add new site' ) }</span>
							</HStack>
						</MenuItem>
					</MenuGroup>
				) }
			</SiteSwitcherBase>
			{ isAddSiteModalOpen && (
				<Modal
					title={ __( 'Add new site' ) }
					onRequestClose={ () => setIsAddSiteModalOpen( false ) }
				>
					<AddNewSite context="sites-dashboard" aiSiteBuilderPath={ aiSiteBuilderPath } />
				</Modal>
			) }
		</>
	);
};

export default SiteSwitcher;
