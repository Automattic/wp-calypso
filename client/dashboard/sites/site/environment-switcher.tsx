import { __experimentalHStack as HStack, Button, Dropdown } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import Environment from '../../components/environment';
import { canCreateStagingSite } from '../features';
import EnvironmentSwitcherDropdown from './environment-switcher-dropdown';
import useCanManageOtherEnvironment from './use-can-manage-other-environment';
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

	const canManageOtherEnvironment = useCanManageOtherEnvironment( site );
	const showEnvironmentToggle =
		canManageOtherEnvironment ||
		canCreateStagingSite( site ) ||
		isStagingSiteCreating ||
		isStagingSiteDeleting;

	if ( ! showEnvironmentToggle ) {
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
