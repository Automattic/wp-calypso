import {
	siteByIdQuery,
	stagingSiteCreateMutation,
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
} from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
	NavigableMenu,
	Spinner,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, chevronDownSmall, plus } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { production, staging } from '../../components/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import {
	hasStagingSite,
	getProductionSiteId,
	getStagingSiteId,
} from '../../utils/site-staging-site';
import { canManageSite, canCreateStagingSite } from '../features';
import type { Site } from '@automattic/api-core';

type EnvironmentType = 'production' | 'staging';

const Environment = ( { env }: { env: EnvironmentType } ) => {
	if ( env === 'staging' ) {
		return (
			<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
				<Icon icon={ staging } />
				<span>{ __( 'Staging' ) }</span>
			</HStack>
		);
	}

	return (
		<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
			<Icon icon={ production } />
			<span>{ __( 'Production' ) }</span>
		</HStack>
	);
};

const CurrentEnvironment = ( { site }: { site: Site } ) => {
	if ( site.is_wpcom_staging_site ) {
		return <Environment env="staging" />;
	}

	return <Environment env="production" />;
};

const EnvironmentSwitcherDropdown = ( {
	currentSite,
	otherEnvironment,
	otherEnvironmentSite,
	stagingSiteExists,
	onClose,
}: {
	currentSite: Site;
	otherEnvironment: EnvironmentType;
	otherEnvironmentSite?: Site;
	stagingSiteExists: boolean;
	onClose: () => void;
} ) => {
	// TODO: CHheck if this logic can be simplified once the whole flow for adding and deleting staging sites is working
	// and the UI correctly reflects ongoing processes.
	const productionSite = otherEnvironment === 'staging' ? currentSite : otherEnvironmentSite;
	let stagingSite;
	if ( otherEnvironment === 'staging' ) {
		stagingSite = stagingSiteExists ? otherEnvironmentSite : undefined;
	} else {
		stagingSite = currentSite;
	}
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( stagingSiteCreateMutation( productionSite?.ID ?? 0 ) );
	const handleCreate = () => {
		recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' );
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Staging site created.' ), { type: 'snackbar' } );
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_failure' );
				createErrorNotice(
					sprintf(
						// translators: "reason" is why adding the staging site failed.
						__( 'Failed to create staging site: %(reason)s' ),
						{ reason: error.message }
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	// TODO: Handle upsell.
	const handleUpsell = () => {};

	return (
		<NavigableMenu>
			<MenuGroup>
				{ productionSite && canManageSite( productionSite ) && (
					<RouterLinkMenuItem to={ `/sites/${ productionSite.slug }` } onClick={ onClose }>
						<Environment env="production" />
					</RouterLinkMenuItem>
				) }
				{ stagingSite && canManageSite( stagingSite ) && (
					<RouterLinkMenuItem to={ `/sites/${ stagingSite.slug }` } onClick={ onClose }>
						<Environment env="staging" />
					</RouterLinkMenuItem>
				) }
				{ ! currentSite.is_wpcom_staging_site && productionSite && ! stagingSiteExists && (
					<MenuItem
						onClick={ canCreateStagingSite( productionSite ) ? handleCreate : handleUpsell }
					>
						<HStack justify="flex-start">
							{ mutation.isPending ? (
								<>
									<Spinner style={ { width: '24px', height: '24px', padding: '4px', margin: 0 } } />
									<span>{ __( 'Creating staging site…' ) }</span>
								</>
							) : (
								<>
									<Icon icon={ plus } />
									<span>{ __( 'Add staging site' ) }</span>
								</>
							) }
						</HStack>
					</MenuItem>
				) }
			</MenuGroup>
		</NavigableMenu>
	);
};

const EnvironmentSwitcher = ( { site }: { site: Site } ) => {
	const queryClient = useQueryClient();

	const productionSiteId = getProductionSiteId( site );
	const stagingSiteId = getStagingSiteId( site );

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	const { data: isStagingSiteDeleting } = useQuery( {
		...isDeletingStagingSiteQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	// Staging site deletion process runs via async job. We need to keep on polling for the staging site deletion before we start displaying the button to add a staging site again
	const { data: stagingSiteExistsFromQuery } = useQuery( {
		...hasStagingSiteQuery( productionSiteId ?? 0 ),
		refetchInterval: isStagingSiteDeleting ? 3000 : false,
		enabled: !! productionSiteId && isStagingSiteDeleting,
	} );

	// Clean up deletion flag when staging site no longer exists
	useEffect( () => {
		if ( isStagingSiteDeleting && stagingSiteExistsFromQuery === false && stagingSiteId ) {
			queryClient.removeQueries( isDeletingStagingSiteQuery( stagingSiteId ) );
			queryClient.removeQueries( hasStagingSiteQuery( productionSiteId ?? 0 ) );
		}
	}, [
		isStagingSiteDeleting,
		stagingSiteExistsFromQuery,
		stagingSiteId,
		productionSiteId,
		queryClient,
	] );

	const stagingSiteExists =
		stagingSiteExistsFromQuery !== undefined ? stagingSiteExistsFromQuery : hasStagingSite( site );

	return (
		<HStack style={ { width: 'auto', flexShrink: 0 } }>
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => {
					// TO DO: Let's make sure to revise these conditions and simplify them once we have the design and the full understanding of how the
					// deletion in progress should look like and if it should have a loading state during deletion.
					const canToggle =
						! isStagingSiteDeleting &&
						( stagingSiteExists ||
							( productionSite && canManageSite( productionSite ) ) ||
							( stagingSite && canManageSite( stagingSite ) ) ||
							( ! stagingSiteExists && productionSite ) );

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
							<CurrentEnvironment site={ site } />
						</Button>
					);
				} }
				renderContent={ ( { onClose } ) => (
					<EnvironmentSwitcherDropdown
						currentSite={ site }
						otherEnvironment={ site.is_wpcom_staging_site ? 'production' : 'staging' }
						otherEnvironmentSite={ site.is_wpcom_staging_site ? productionSite : stagingSite }
						stagingSiteExists={ stagingSiteExists }
						onClose={ onClose }
					/>
				) }
			/>
		</HStack>
	);
};

export default EnvironmentSwitcher;
