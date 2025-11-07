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
import AddNewSite from '../add-new-site';
import { SiteSwitcherBase } from './base';

const SiteSwitcher = () => {
	const [ isAddSiteModalOpen, setIsAddSiteModalOpen ] = useState( false );

	return (
		<>
			<SiteSwitcherBase>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							onClick={ () => {
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
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
		</>
	);
};

export default SiteSwitcher;
