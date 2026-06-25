import { __experimentalHStack as HStack, Button, Dropdown } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown } from '@wordpress/icons';
import Environment from '../../components/environment';
import EnvironmentSwitcherDropdown from './environment-switcher-dropdown';
import useCanSwitchToOtherEnvironment from './use-can-switch-to-other-environment';
import useStagingSite from './use-staging-site';
import type { Site } from '@automattic/api-core';

import './sidebar-environment-switcher.scss';

const SidebarEnvironmentSwitcher = ( { site }: { site: Site } ) => {
	const {
		productionSite,
		stagingSite,
		isStagingSiteCreating,
		isStagingSiteDeleting,
		handleAddStagingSite,
		environmentType,
	} = useStagingSite( site );

	const canToggle = useCanSwitchToOtherEnvironment( site );

	return (
		<HStack expanded={ false } style={ { flexShrink: 0 } } className="sidebar-environment-switcher">
			<Environment environmentType={ environmentType } />
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						className="sidebar-environment-switcher__toggle"
						variant="tertiary"
						disabled={ ! canToggle }
						onClick={ onToggle }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( ! isOpen && event.code === 'ArrowDown' ) {
								event.preventDefault();
								onToggle();
							}
						} }
						aria-haspopup="true"
						aria-expanded={ isOpen }
						label={ __( 'Switch environment' ) }
						icon={ chevronUpDown }
						size="small"
					/>
				) }
				renderContent={ ( { onClose } ) => (
					<EnvironmentSwitcherDropdown
						currentSite={ site }
						productionSite={ productionSite }
						stagingSite={ stagingSite }
						onClose={ onClose }
						onAddStagingSite={ handleAddStagingSite }
						isStagingSiteDeleting={ isStagingSiteDeleting }
						isStagingSiteCreating={ isStagingSiteCreating }
					/>
				) }
			/>
		</HStack>
	);
};

export default SidebarEnvironmentSwitcher;
