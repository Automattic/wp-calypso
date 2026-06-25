import { __experimentalHStack as HStack, Button, Dropdown } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import Environment from '../../components/environment';
import EnvironmentSwitcherDropdown from './environment-switcher-dropdown';
import useCanSwitchToOtherEnvironment from './use-can-switch-to-other-environment';
import useStagingSite from './use-staging-site';
import type { Site } from '@automattic/api-core';

const EnvironmentSwitcher = ( { site }: { site: Site } ) => {
	const {
		productionSite,
		stagingSite,
		isStagingSiteCreating,
		isStagingSiteDeleting,
		handleAddStagingSite,
		environmentType,
	} = useStagingSite( site );

	const canToggle = useCanSwitchToOtherEnvironment( site );

	if ( ! canToggle ) {
		return (
			<HStack expanded={ false } style={ { flexShrink: 0 } }>
				<Environment environmentType={ environmentType } />
			</HStack>
		);
	}

	return (
		<HStack expanded={ false } style={ { flexShrink: 0 } }>
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						className="dashboard-menu__item active"
						icon={ chevronDownSmall }
						iconPosition="right"
						onClick={ onToggle }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( ! isOpen && event.code === 'ArrowDown' ) {
								event.preventDefault();
								onToggle();
							}
						} }
						aria-haspopup="true"
						aria-expanded={ isOpen }
					>
						<Environment environmentType={ environmentType } />
					</Button>
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

export default EnvironmentSwitcher;
