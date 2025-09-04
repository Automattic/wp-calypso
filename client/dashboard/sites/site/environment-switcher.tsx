import {
	siteByIdQuery,
	stagingSiteCreateMutation,
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
	siteLatestAtomicTransferQuery,
	isCreatingStagingSiteQuery,
} from '@automattic/api-queries';
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
import { useState } from 'react';
import { production, staging } from '../../components/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import {
	isAtomicTransferInProgress,
	isAtomicTransferredSite,
} from '../../utils/site-atomic-transfers';
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

const StagingSiteActionButton = ( {
	isStagingSiteDeleting,
	isStagingSiteCreating,
}: {
	isStagingSiteDeleting: boolean;
	isStagingSiteCreating: boolean;
} ) => {
	if ( isStagingSiteCreating ) {
		return (
			<>
				<Spinner style={ { width: '24px', height: '24px', padding: '4px', margin: 0 } } />
				<span>{ __( 'Creating staging site…' ) }</span>
			</>
		);
	}

	if ( isStagingSiteDeleting ) {
		return (
			<>
				<Spinner style={ { width: '24px', height: '24px', padding: '4px', margin: 0 } } />
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
	otherEnvironment,
	otherEnvironmentSite,
	stagingSiteExists,
	onClose,
	onAddStagingSite,
	isStagingSiteDeleting,
	isStagingSiteCreating,
}: {
	currentSite: Site;
	otherEnvironment: EnvironmentType;
	otherEnvironmentSite?: Site;
	stagingSiteExists: boolean;
	onClose: () => void;
	onAddStagingSite: () => void;
	isStagingSiteDeleting: boolean;
	isStagingSiteCreating: boolean;
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
						onClick={ canCreateStagingSite( productionSite ) ? onAddStagingSite : handleUpsell }
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
	const [ createdStagingSiteId, setCreatedStagingSiteId ] = useState< number | null >( null );

	const productionSiteId = getProductionSiteId( site );
	const stagingSiteId = getStagingSiteId( site ) || createdStagingSiteId;

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const { data: atomicTransfer } = useQuery( {
		...siteLatestAtomicTransferQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			return isAtomicTransferInProgress( query.state.data?.status ?? 'pending' ) ? 2000 : false;
		},
		enabled: !! stagingSiteId,
	} );

	const transferStatus = atomicTransfer?.status;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return ! isAtomicTransferredSite( query.state.data ) ? 2000 : false;
		},
		enabled: !! stagingSiteId && transferStatus === 'completed',
	} );

	const { data: isStagingSiteDeleting } = useQuery( {
		...isDeletingStagingSiteQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	const { data: isStagingSiteCreating } = useQuery( {
		...isCreatingStagingSiteQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );
	// Staging site deletion process runs via async job. We need to keep on polling for the staging site deletion before we start displaying the button to add a staging site again
	const { data: stagingSiteExistsFromQuery } = useQuery( {
		...hasStagingSiteQuery( productionSiteId ?? 0 ),
		refetchInterval: isStagingSiteDeleting ? 3000 : false,
		enabled: !! productionSiteId && isStagingSiteDeleting,
	} );

	// Clean up deletion flag when staging site no longer exists
	useEffect( () => {
		if (
			isStagingSiteDeleting &&
			stagingSiteExistsFromQuery === false &&
			productionSite &&
			! hasStagingSite( productionSite ) &&
			stagingSiteId
		) {
			queryClient.removeQueries( isDeletingStagingSiteQuery( stagingSiteId ) );
			queryClient.removeQueries( hasStagingSiteQuery( productionSiteId ?? 0 ) );
		}
	}, [
		isStagingSiteDeleting,
		stagingSiteExistsFromQuery,
		stagingSiteId,
		productionSiteId,
		queryClient,
		productionSite,
	] );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const isStagingSiteReady =
		isStagingSiteCreating && stagingSite && isAtomicTransferredSite( stagingSite );

	useEffect( () => {
		const handleStagingSiteReady = async () => {
			if ( ! stagingSite ) {
				return;
			}
			createSuccessNotice( __( 'Staging site created.' ), { type: 'snackbar' } );
			queryClient.setQueryData(
				isCreatingStagingSiteQuery( productionSiteId ?? 0 ).queryKey,
				false
			);
		};

		if ( isStagingSiteReady ) {
			handleStagingSiteReady();
		}
	}, [ queryClient, isStagingSiteReady, stagingSite, createSuccessNotice, productionSiteId ] );

	const mutation = useMutation( stagingSiteCreateMutation( productionSite?.ID ?? 0 ) );

	const handleAddStagingSite = () => {
		mutation.mutate( undefined, {
			onSuccess: ( data: { id: number } ) => {
				setCreatedStagingSiteId( data.id );
			},
			onError: ( error: Error ) => {
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

	const stagingSiteExists =
		stagingSiteExistsFromQuery !== undefined ? stagingSiteExistsFromQuery : hasStagingSite( site );

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
						otherEnvironment={ site.is_wpcom_staging_site ? 'production' : 'staging' }
						otherEnvironmentSite={ site.is_wpcom_staging_site ? productionSite : stagingSite }
						stagingSiteExists={ stagingSiteExists }
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
