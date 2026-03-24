import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	Dropdown,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronUpDown } from '@wordpress/icons';
import { staging, production } from '../../components/icons';
import { canManageSite } from '../features';
import EnvironmentSwitcherDropdown from './environment-switcher-dropdown';
import useStagingSite from './use-staging-site';
import type { Site } from '@automattic/api-core';

import './environment-switcher-v2.scss';

const CurrentEnvironment = ( { site }: { site: Site } ) => {
	const icon = site.is_wpcom_staging_site ? staging : production;
	const label = site.is_wpcom_staging_site ? __( 'Staging' ) : __( 'Production' );

	return (
		<HStack justify="flex-start" spacing={ 2 } expanded={ false } style={ { flexShrink: 0 } }>
			<Icon icon={ icon } size={ 20 } />
			<Text weight={ 500 }>{ label }</Text>
		</HStack>
	);
};

const EnvironmentSwitcher = ( { site }: { site: Site } ) => {
	const {
		productionSite,
		stagingSite,
		isStagingSiteCreating,
		isStagingSiteDeleting,
		handleAddStagingSite,
	} = useStagingSite( site );

	// TODO: Let's make sure to revise these conditions and simplify them once we have the design and the full understanding of how the
	// deletion in progress should look like and if it should have a loading state during deletion.
	const canToggle =
		( productionSite && canManageSite( productionSite ) ) ||
		( stagingSite && canManageSite( stagingSite ) );

	return (
		<HStack expanded={ false } style={ { flexShrink: 0 } } className="environment-switcher-v2">
			<CurrentEnvironment site={ site } />
			{ canToggle && (
				<Dropdown
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button
							className="environment-switcher-v2__toggle"
							variant="tertiary"
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
			) }
		</HStack>
	);
};

export default EnvironmentSwitcher;
