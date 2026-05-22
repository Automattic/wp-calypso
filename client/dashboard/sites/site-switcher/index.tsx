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
import { AI_SITE_BUILDER_SPEC_FLOW } from '../ai-site-builder-spec-flow';
import { SiteSwitcherBase } from './base';
import type { SiteSwitcherProps } from './types';

const SiteSwitcher = ( props: SiteSwitcherProps ) => {
	const { recordTracksEvent } = useAnalytics();
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );
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
					<AddNewSite
						context="sites-dashboard"
						aiSiteBuilderPath={ `/setup/${ AI_SITE_BUILDER_SPEC_FLOW }` }
					/>
				</Modal>
			) }
		</>
	);
};

export default SiteSwitcher;
