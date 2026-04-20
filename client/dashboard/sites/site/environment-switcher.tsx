import { __experimentalHStack as HStack, Button, Dropdown } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import Environment from '../../components/environment';
import { canManageSite } from '../features';
import EnvironmentSwitcherDropdown from './environment-switcher-dropdown';
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

	return (
		<HStack expanded={ false } style={ { flexShrink: 0 } }>
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => {
					// TODO: Let's make sure to revise these conditions and simplify them once we have the design and the full understanding of how the
					// deletion in progress should look like and if it should have a loading state during deletion.
					const canToggle =
						( productionSite && canManageSite( productionSite ) ) ||
						( stagingSite && canManageSite( stagingSite ) );

					return (
						<Button
							className="dashboard-menu__item active"
							icon={ canToggle ? chevronDownSmall : null }
							iconPosition="right"
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
						>
							<Environment environmentType={ environmentType } />
						</Button>
					);
				} }
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
