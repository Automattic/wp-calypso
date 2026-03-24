import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
	NavigableMenu,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronUpDown, plus } from '@wordpress/icons';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import Environment from '../../components/environment';
import { staging, production } from '../../components/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { canManageSite, canCreateStagingSite } from '../features';
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
