import {
	siteByIdQuery,
	pushToStagingMutation,
	pullFromStagingMutation,
} from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	CardDivider,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	CheckboxControl,
	SelectControl,
} from '@wordpress/components';
import { createInterpolateElement, useState, useCallback, useMemo } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import useRewindableActivityLogQuery from '../../../data/activity-log/use-rewindable-activity-log-query';
import { SUCCESSFUL_BACKUP_ACTIVITIES } from '../../../lib/jetpack/backup-utils';
import FileBrowser from '../../../my-sites/backup/backup-contents-page/file-browser';
import {
	FileBrowserProvider,
	useFileBrowserContext,
} from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import Environment, { EnvironmentType } from '../../components/environment';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import type { FileBrowserConfig } from '../../../my-sites/backup/backup-contents-page/file-browser';

// File browser config used for granular selection
const fileBrowserConfig: FileBrowserConfig = {
	restrictedTypes: [ 'plugin', 'theme' ],
	restrictedPaths: [ 'wp-content' ],
	excludeTypes: [ 'wordpress' ],
	alwaysInclude: [ 'wp-config.php' ],
	showFileCard: false,
	showBackupTime: false,
	showSeparateExpandButton: true,
	expandDirectoriesOnClick: false,
	showHeader: false,
};

type BackupActivity = { rewindId: number; activityTs: number };

const DirectionArrow = () => {
	return (
		<Icon
			icon={ isRTL() ? chevronLeft : chevronRight }
			style={ {
				fill: '#949494',
			} }
		/>
	);
};

interface EnvironmentLabelProps {
	environmentType: EnvironmentType;
	siteTitle?: string;
}

const EnvironmentLabel = ( { environmentType, siteTitle }: EnvironmentLabelProps ) => {
	return (
		<VStack spacing={ 1 }>
			<HStack spacing={ 2 }>
				<Environment environmentType={ environmentType } />
				{ siteTitle && (
					<Text
						variant="muted"
						style={ {
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							maxWidth: '190px',
						} }
					>
						{ siteTitle }
					</Text>
				) }
			</HStack>
		</VStack>
	);
};
interface EnvironmentConfig {
	title: string;
	description: string;
	syncFrom: EnvironmentType;
	syncTo: EnvironmentType;
}

interface SyncConfig {
	staging: EnvironmentConfig;
	production: EnvironmentConfig;
	learnMore: string;
	submit: string;
}

const getSyncConfig = ( type: 'pull' | 'push' ): SyncConfig => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
				syncFrom: 'production',
				syncTo: 'staging',
			},
			production: {
				title: __( 'Pull from Staging' ),
				description: __(
					'Pulling will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
				syncFrom: 'staging',
				syncTo: 'production',
			},
			learnMore: __( 'Read more about <a>environment pull</a>.' ),
			submit: __( 'Pull' ),
		};
	}

	return {
		staging: {
			title: __( 'Push to Production' ),
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
			),
			syncFrom: 'staging',
			syncTo: 'production',
		},
		production: {
			title: __( 'Push to Staging' ),
			description: __(
				'Pushing will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
			),
			syncFrom: 'production',
			syncTo: 'staging',
		},
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

interface StagingSiteSyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	productionSiteId: number;
	stagingSiteId: number;
	onSyncStart: () => void;
}

function StagingSiteSyncModalInner( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
	onSyncStart,
}: StagingSiteSyncModalProps ) {
	const syncConfig = getSyncConfig( syncType );
	const [ domainConfirmation, setDomainConfirmation ] = useState( '' );
	const [ isFileBrowserVisible, setIsFileBrowserVisible ] = useState( false );

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );
	const productionSiteSlug = productionSite?.slug;
	const productionSiteTitle = productionSite?.name;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );
	const stagingSiteSlug = stagingSite?.slug;
	const stagingSiteTitle = stagingSite?.name;

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;

	const sourceSiteTitle = sourceEnvironment === 'staging' ? stagingSiteTitle : productionSiteTitle;
	const targetSiteTitle =
		targetEnvironment === 'production' ? productionSiteTitle : stagingSiteTitle;

	const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;
	const querySiteSlug = sourceEnvironment === 'staging' ? stagingSiteSlug : productionSiteSlug;

	const pullMutation = useMutation( pullFromStagingMutation( productionSiteId, stagingSiteId ) );
	const pushMutation = useMutation( pushToStagingMutation( productionSiteId, stagingSiteId ) );

	const handleClose = useCallback( () => {
		onClose();
	}, [ onClose ] );

	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList();

	const WP_CONFIG_PATH = '/wp-config.php';
	const WP_CONTENT_PATH = '/wp-content';
	const SQL_PATH = '/sql';

	const wpContentNode = fileBrowserState.getNode( WP_CONTENT_PATH );
	const wpConfigNode = fileBrowserState.getNode( WP_CONFIG_PATH );
	const sqlNode = fileBrowserState.getNode( SQL_PATH );

	const filesAndFoldersNodesCheckState = useMemo( () => {
		const nodes = [ wpContentNode, wpConfigNode ].filter( Boolean );
		if ( nodes.length === 0 ) {
			return 'unchecked';
		}
		const checkedCount = nodes.filter( ( node ) => node?.checkState === 'checked' ).length;
		const mixedCount = nodes.filter( ( node ) => node?.checkState === 'mixed' ).length;
		if ( mixedCount > 0 ) {
			return 'mixed';
		}
		if ( checkedCount === nodes.length ) {
			return 'checked';
		}
		if ( checkedCount === 0 ) {
			return 'unchecked';
		}
		return 'mixed';
	}, [ wpContentNode, wpConfigNode ] );

	const updateFilesAndFoldersCheckState = useCallback(
		( checkState: 'checked' | 'unchecked' | 'mixed' ) => {
			fileBrowserState.setNodeCheckState( WP_CONTENT_PATH, checkState );
			fileBrowserState.setNodeCheckState( WP_CONFIG_PATH, checkState );
		},
		[ fileBrowserState ]
	);

	const onFilesFoldersCheckboxChange = useCallback( () => {
		updateFilesAndFoldersCheckState(
			filesAndFoldersNodesCheckState === 'checked' ? 'unchecked' : 'checked'
		);
	}, [ filesAndFoldersNodesCheckState, updateFilesAndFoldersCheckState ] );

	const handleDatabaseCheckboxChange = useCallback( () => {
		if ( sqlNode?.checkState === 'checked' ) {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'unchecked' );
		} else {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'checked' );
		}
	}, [ fileBrowserState, sqlNode ] );

	const handleFileSelectionModeChange = useCallback(
		( value: string ) => {
			const isExpanded = value === 'true';
			setIsFileBrowserVisible( isExpanded );
			if ( ! isExpanded ) {
				updateFilesAndFoldersCheckState( 'unchecked' );
			}
		},
		[ updateFilesAndFoldersCheckState ]
	);

	// Determine latest successful backup for rewindId/display
	const activityQuery = useRewindableActivityLogQuery(
		querySiteId,
		{
			name: SUCCESSFUL_BACKUP_ACTIVITIES,
			aggregate: false,
			number: 1,
			sortOrder: 'desc',
		},
		{}
	) as { data: BackupActivity[] | undefined; isLoading: boolean };
	const { data: backupData, isLoading: isLoadingBackupAttempt } = activityQuery;

	const lastKnownBackupAttempt: BackupActivity | undefined = backupData?.[ 0 ];
	const rewindId = lastKnownBackupAttempt?.rewindId;

	const locale = useLocale();
	const displayBackupDate = lastKnownBackupAttempt
		? new Intl.DateTimeFormat( locale, { dateStyle: 'medium', timeStyle: 'short' } ).format(
				new Date( lastKnownBackupAttempt.activityTs )
		  )
		: null;

	const shouldDisableGranularSync = ! lastKnownBackupAttempt && ! isLoadingBackupAttempt;
	const hasWarning = shouldDisableGranularSync || sqlNode?.checkState === 'checked';

	const handleConfirm = () => {
		let include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		let exclude_paths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		if (
			shouldDisableGranularSync ||
			( filesAndFoldersNodesCheckState === 'checked' && sqlNode?.checkState === 'checked' )
		) {
			include_paths = '';
			exclude_paths = '';
		}

		const options = { types: 'paths', include_paths, exclude_paths } as const;

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			pullMutation.mutate( options, {
				onSuccess: () => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success', {
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
					onSyncStart();
					handleClose();
				},
				onError: ( error: Error ) => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
						message: error.message,
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
				},
			} );
		} else {
			pushMutation.mutate( options, {
				onSuccess: () => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success', {
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
					onSyncStart();
					handleClose();
				},
				onError: ( error: Error ) => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
						message: error.message,
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
				},
			} );
		}
	};

	const handleDomainConfirmation = useCallback(
		( value: string | undefined ) => setDomainConfirmation( value || '' ),
		[]
	);

	const showDomainConfirmation = targetEnvironment === 'production' && ! isLoadingBackupAttempt;

	const isGranularMode = isFileBrowserVisible && ! shouldDisableGranularSync;

	const noGranularSelection =
		isGranularMode && browserCheckList.totalItems > 0 && browserCheckList.includeList.length === 0;

	const isSubmitDisabled =
		( showDomainConfirmation && domainConfirmation !== productionSiteSlug ) ||
		noGranularSelection ||
		pullMutation.isPending ||
		pushMutation.isPending;

	return (
		<Modal title={ syncConfig[ environment ].title } onRequestClose={ handleClose } size="large">
			<VStack spacing={ 5 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/activity-log/${ targetSiteSlug }` } children={ null } />,
					} ) }
				</Text>
				<HStack spacing={ 4 } alignment="left">
					<EnvironmentLabel environmentType={ sourceEnvironment } siteTitle={ sourceSiteTitle } />
					<DirectionArrow />
					<EnvironmentLabel environmentType={ targetEnvironment } siteTitle={ targetSiteTitle } />
				</HStack>
				{ /* File selection and database controls */ }
				<VStack spacing={ 5 }>
					<VStack spacing={ 0 }>
						<HStack
							spacing={ 2 }
							justify="space-between"
							alignment="center"
							style={ { padding: '8px 0' } }
						>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Files and folders' ) }
								disabled={ shouldDisableGranularSync }
								checked={
									shouldDisableGranularSync || filesAndFoldersNodesCheckState === 'checked'
								}
								indeterminate={ filesAndFoldersNodesCheckState === 'mixed' }
								onChange={ onFilesFoldersCheckboxChange }
							/>
							<SelectControl
								value={ isFileBrowserVisible ? 'true' : 'false' }
								variant="minimal"
								disabled={ shouldDisableGranularSync }
								options={ [
									{ label: __( 'All files and folders' ), value: 'false' },
									{ label: __( 'Specific files and folders' ), value: 'true' },
								] }
								onChange={ handleFileSelectionModeChange }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								aria-label={ __( 'Select files and folders to sync' ) }
							/>
						</HStack>

						<div hidden={ ! isFileBrowserVisible }>
							<VStack spacing={ 2 }>
								<CardDivider />
								{ displayBackupDate && (
									<HStack alignment="left" spacing={ 1 } style={ { marginInlineStart: '14px' } }>
										<Text variant="muted">
											{ createInterpolateElement(
												__( 'Content from the latest backup: <date />.' ),
												{
													date: <span>{ displayBackupDate }</span>,
												}
											) }{ ' ' }
											<ExternalLink
												href={ `/backup/${ querySiteSlug as string }` }
												children={ __( 'Create new backup' ) }
											/>
										</Text>
									</HStack>
								) }
								<HStack style={ { marginInlineStart: '14px' } }>
									<FileBrowser
										rewindId={ rewindId ?? 0 }
										siteId={ querySiteId }
										siteSlug={ querySiteSlug as string }
										fileBrowserConfig={ fileBrowserConfig }
									/>
								</HStack>
							</VStack>
						</div>
						<HStack
							alignment="left"
							spacing={ 2 }
							style={ {
								borderTop: '1px solid var(--wp-components-color-gray-300, #ddd)',
								borderBottom: hasWarning
									? 'none'
									: '1px solid var(--wp-components-color-gray-300, #ddd)',
								padding: '16px 0',
								marginTop: isFileBrowserVisible ? '16px' : '0',
							} }
						>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Database' ) }
								disabled={ shouldDisableGranularSync }
								checked={ hasWarning }
								onChange={ handleDatabaseCheckboxChange }
							/>
						</HStack>
						{ hasWarning && (
							<VStack style={ { marginTop: '20px' } }>
								<Notice variant="warning" title={ __( 'Warning! Database will be overwritten' ) }>
									{ __(
										'Selecting database option will overwrite the site database, including any posts, pages, products, or orders.'
									) }
								</Notice>
							</VStack>
						) }
					</VStack>

					{ showDomainConfirmation && (
						<InputControl
							__next40pxDefaultSize
							label={
								<HStack style={ { textTransform: 'none' } } alignment="left" spacing={ 1 }>
									<Text>
										{ __( 'Enter your site‘s name' ) }{ ' ' }
										<Text color="var(--dashboard__foreground-color-error)">
											{ productionSiteSlug }
										</Text>{ ' ' }
										{ __( 'to confirm.' ) }
									</Text>
								</HStack>
							}
							onChange={ handleDomainConfirmation }
							value={ domainConfirmation }
						/>
					) }
					<HStack>
						<HStack>
							<Text>
								{ createInterpolateElement( syncConfig.learnMore, {
									a: (
										<InlineSupportLink
											onClick={ handleClose }
											supportContext="hosting-staging-site"
										/>
									),
								} ) }
							</Text>
						</HStack>

						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ handleClose }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ handleConfirm }
								disabled={ isSubmitDisabled }
								isBusy={ pullMutation.isPending || pushMutation.isPending }
							>
								{ syncConfig.submit }
							</Button>
						</ButtonStack>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}

export default function StagingSiteSyncModal( props: StagingSiteSyncModalProps ) {
	const locale = useLocale();
	const notices = {
		showError: () => {},
		showSuccess: () => {},
	};

	return (
		<FileBrowserProvider locale={ locale } notices={ notices }>
			<StagingSiteSyncModalInner { ...props } />
		</FileBrowserProvider>
	);
}
