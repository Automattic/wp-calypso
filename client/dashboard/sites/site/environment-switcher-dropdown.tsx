import {
	__experimentalHStack as HStack,
	MenuGroup,
	MenuItem,
	NavigableMenu,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, plus } from '@wordpress/icons';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import Environment from '../../components/environment';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { canManageSite, canCreateStagingSite } from '../features';
import type { Site } from '@automattic/api-core';

const StagingSiteActionButton = ( {
	isStagingSiteDeleting,
	isStagingSiteCreating,
}: {
	isStagingSiteDeleting: boolean;
	isStagingSiteCreating: boolean;
} ) => {
	const spinnerStyle = { width: '24px', height: '24px', padding: '4px', margin: 0 };
	if ( isStagingSiteCreating ) {
		return (
			<>
				<Spinner style={ spinnerStyle } />
				<span>{ __( 'Adding staging site…' ) }</span>
			</>
		);
	}

	if ( isStagingSiteDeleting ) {
		return (
			<>
				<Spinner style={ spinnerStyle } />
				<span>{ __( 'Deleting staging site…' ) }</span>
			</>
		);
	}
	return (
		<>
			<Icon icon={ plus } />
			<span>{ __( 'Add staging site' ) }</span>
		</>
	);
};

const EnvironmentSwitcherDropdown = ( {
	currentSite,
	productionSite,
	stagingSite,
	onClose,
	onAddStagingSite,
	isStagingSiteDeleting,
	isStagingSiteCreating,
}: {
	currentSite: Site;
	productionSite: Site | undefined;
	stagingSite: Site | undefined;
	onClose: () => void;
	onAddStagingSite: () => void;
	isStagingSiteDeleting: boolean;
	isStagingSiteCreating: boolean;
} ) => {
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	// TODO: Handle upsell.
	const handleUpsell = () => {};

	const showStagingSite =
		stagingSite &&
		canManageSite( stagingSite ) &&
		! isStagingSiteDeleting &&
		! isStagingSiteCreating;

	const showActionButton =
		( ! currentSite.is_wpcom_staging_site && productionSite && ! stagingSite ) ||
		isStagingSiteCreating ||
		isStagingSiteDeleting;

	return (
		<NavigableMenu>
			<MenuGroup>
				{ productionSite && canManageSite( productionSite ) && (
					<RouterLinkMenuItem
						to={ buildCurrentRouteLink( { params: { siteSlug: productionSite.slug } } ) }
						onClick={ onClose }
					>
						<Environment environmentType="production" />
					</RouterLinkMenuItem>
				) }
				{ showStagingSite && (
					<RouterLinkMenuItem
						to={ buildCurrentRouteLink( { params: { siteSlug: stagingSite.slug } } ) }
						onClick={ onClose }
					>
						<Environment environmentType="staging" />
					</RouterLinkMenuItem>
				) }
				{ showActionButton && (
					<MenuItem
						onClick={
							productionSite && canCreateStagingSite( productionSite )
								? onAddStagingSite
								: handleUpsell
						}
						disabled={ isStagingSiteCreating || isStagingSiteDeleting }
					>
						<HStack justify="flex-start" spacing={ 1 }>
							<StagingSiteActionButton
								isStagingSiteDeleting={ isStagingSiteDeleting }
								isStagingSiteCreating={ isStagingSiteCreating }
							/>
						</HStack>
					</MenuItem>
				) }
			</MenuGroup>
		</NavigableMenu>
	);
};

export default EnvironmentSwitcherDropdown;
