import {
	siteByIdQuery,
	stagingSiteCreateMutation,
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
	hasValidQuotaQuery,
	jetpackConnectionHealthQuery,
	siteLatestAtomicTransferQuery,
	isCreatingStagingSiteQuery,
	siteBySlugQuery,
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
import { useHelpCenter } from '../../app/help-center';
import { production, staging } from '../../components/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import {
	isAtomicTransferInProgress,
	isAtomicTransferredSite,
} from '../../utils/site-atomic-transfers';
import { getProductionSiteId, getStagingSiteId } from '../../utils/site-staging-site';
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
					<RouterLinkMenuItem to={ `/sites/${ productionSite.slug }` } onClick={ onClose }>
						<Environment env="production" />
					</RouterLinkMenuItem>
				) }
				{ showStagingSite && (
					<RouterLinkMenuItem to={ `/sites/${ stagingSite.slug }` } onClick={ onClose }>
						<Environment env="staging" />
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
						<HStack justify="flex-start">
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
	const queryClient = useQueryClient();

	const productionSiteId = getProductionSiteId( site );

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const stagingSiteId = getStagingSiteId( productionSite ?? site );

	const { data: isStagingSiteCreating } = useQuery( {
		...isCreatingStagingSiteQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const { data: atomicTransfer } = useQuery( {
		...siteLatestAtomicTransferQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			return isAtomicTransferInProgress( query.state.data?.status ?? 'pending' ) ? 2000 : false;
		},
		enabled: isStagingSiteCreating && !! stagingSiteId,
	} );
	const transferStatus = atomicTransfer?.status;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return isAtomicTransferredSite( query.state.data ) ? false : 2000;
		},
		enabled: !! stagingSiteId && transferStatus === 'completed',
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

	const { createSuccessNotice, createNotice, createErrorNotice } = useDispatch( noticesStore );

	// Clean up deletion flag when staging site no longer exists
	useEffect( () => {
		const invalidateQueries = async (
			productionSiteId: number,
			productionSiteSlug: string,
			stagingSiteId: number
		) => {
			// Ensure the new site is retrieved before invalidating the deletion flag
			await queryClient.invalidateQueries( siteByIdQuery( productionSiteId ) );
			await queryClient.invalidateQueries( siteBySlugQuery( productionSiteSlug ) );
			await queryClient.invalidateQueries( isDeletingStagingSiteQuery( stagingSiteId ) );
		};
		if (
			isStagingSiteDeleting &&
			stagingSiteExistsFromQuery === false &&
			productionSiteId &&
			productionSite &&
			stagingSiteId
		) {
			createSuccessNotice( __( 'Staging site deleted.' ), {
				type: 'snackbar',
			} );
			invalidateQueries( productionSiteId, productionSite?.slug, stagingSiteId );
		}
	}, [
		isStagingSiteDeleting,
		stagingSiteExistsFromQuery,
		queryClient,
		stagingSiteId,
		productionSiteId,
		productionSite,
		createSuccessNotice,
	] );

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const isStagingSiteReady =
		isStagingSiteCreating && stagingSite && isAtomicTransferredSite( stagingSite );

	useEffect( () => {
		if ( ! stagingSite ) {
			return;
		}
		if ( isStagingSiteReady ) {
			createSuccessNotice( __( 'Staging site added.' ), {
				type: 'snackbar',
				explicitDismiss: true,
			} );
			productionSite && queryClient.invalidateQueries( siteBySlugQuery( productionSite.slug ) );
			queryClient.setQueryData(
				isCreatingStagingSiteQuery( productionSiteId ?? 0 ).queryKey,
				false
			);
		}
	}, [
		queryClient,
		isStagingSiteReady,
		stagingSite,
		createSuccessNotice,
		productionSiteId,
		productionSite,
	] );

	const mutation = useMutation( stagingSiteCreateMutation( productionSite?.ID ?? 0 ) );

	const { data: hasValidQuota, error: isErrorValidQuota } = useQuery( {
		...hasValidQuotaQuery( productionSite?.ID ?? 0 ),
		enabled: !! productionSite?.ID && ! stagingSite && ! isStagingSiteCreating,
		meta: {
			persist: false,
		},
	} );

	const { data: connectionHealth } = useQuery( {
		...jetpackConnectionHealthQuery( productionSite?.ID ?? 0 ),
		enabled: !! productionSite?.ID && ! stagingSite && ! isStagingSiteCreating,
	} );

	const handleAddStagingSite = () => {
		recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' );

		if ( isErrorValidQuota ) {
			createNotice(
				'error',
				__( 'Cannot add a staging site due to site quota validation issue.' ),
				{
					type: 'snackbar',
					actions: [
						{
							label: __( 'Contact support' ),
							url: null,
							onClick: () => {
								setNavigateToRoute( '/odie' );
								setShowHelpCenter( true );
							},
						},
					],
				}
			);
			return;
		}

		if ( ! hasValidQuota ) {
			createErrorNotice(
				__(
					'Your available storage space is below 50%, which is insufficient for creating a staging site.'
				),
				{
					type: 'snackbar',
				}
			);
			return;
		}

		if ( ! connectionHealth?.is_healthy ) {
			createNotice( 'error', __( 'Cannot add a staging site due to a Jetpack connection issue.' ), {
				type: 'snackbar',
				actions: [
					{
						label: __( 'Contact support' ),
						url: null,
						onClick: () => {
							setNavigateToRoute( '/odie' );
							setShowHelpCenter( true );
						},
					},
				],
			} );
			return;
		}

		createSuccessNotice(
			__( 'We are adding your staging site. We will send you an email when it is done.' ),
			{
				type: 'snackbar',
			}
		);

		mutation.mutate( undefined, {
			onSuccess: () => {
				queryClient.invalidateQueries( siteByIdQuery( productionSiteId ?? 0 ) );
				queryClient.invalidateQueries( hasStagingSiteQuery( productionSiteId ?? 0 ) );
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

	return (
		<HStack style={ { width: 'auto', flexShrink: 0 } }>
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
							<CurrentEnvironment site={ site } />
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
						isStagingSiteDeleting={ !! isStagingSiteDeleting }
						isStagingSiteCreating={ !! isStagingSiteCreating }
					/>
				) }
			/>
		</HStack>
	);
};

export default EnvironmentSwitcher;
