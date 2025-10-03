import { pushToStagingMutation, pullFromStagingMutation } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	CheckboxControl,
	SelectControl,
	Notice,
	Tooltip,
} from '@wordpress/components';
import {
	createInterpolateElement,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { EnvironmentType } from 'calypso/dashboard/components/environment';
import InlineSupportLink from 'calypso/dashboard/components/inline-support-link';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import SiteEnvironmentBadge from 'calypso/dashboard/components/site-environment-badge';
import FileBrowser from 'calypso/my-sites/backup/backup-contents-page/file-browser';
import {
	FileBrowserProvider,
	useFileBrowserContext,
} from 'calypso/my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useFirstMatchingBackupAttempt } from 'calypso/my-sites/backup/hooks';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import type { FileBrowserConfig } from 'calypso/my-sites/backup/backup-contents-page/file-browser';

import './style.scss';

interface SyncError extends Error {
	code?: string;
}

const WP_ROOT_PATH = '/';
const WP_CONFIG_PATH = '/wp-config.php';
const WP_CONTENT_PATH = '/wp-content';
const SQL_PATH = '/sql';

const fileBrowserConfig: FileBrowserConfig = {
	restrictedTypes: [ 'plugin', 'theme' ],
	restrictedPaths: [ 'wp-content' ],
	excludeTypes: [ 'wordpress' ],
	alwaysInclude: [ 'wp-config.php' ],
	showFileCard: false,
	showBackupTime: true,
	showSeparateExpandButton: true,
	expandDirectoriesOnClick: false,
	showHeader: false,
};

const DirectionArrow = () => {
	return (
		<div style={ { marginTop: '44px' } }>
			<Icon
				icon={ isRTL() ? chevronLeft : chevronRight }
				style={ {
					fill: '#949494',
				} }
			/>
		</div>
	);
};

interface EnvironmentLabelProps {
	label: string;
	environmentType: EnvironmentType;
	siteTitle?: string;
}

const EnvironmentLabel = ( { label, environmentType, siteTitle }: EnvironmentLabelProps ) => {
	return (
		<VStack spacing={ 1 }>
			<SectionHeader level={ 3 } title={ label } />
			<HStack spacing={ 2 }>
				<SiteEnvironmentBadge environmentType={ environmentType } />
				{ siteTitle && (
					<Text
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

interface SyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	productionSiteId: number;
	stagingSiteId: number;
	onSyncStart: () => void;
}

interface EnvironmentConfig {
	title: string;
	description: string;
	syncFrom: EnvironmentType;
	syncTo: EnvironmentType;
}

interface SyncConfig {
	staging: EnvironmentConfig;
	production: EnvironmentConfig;
	fromLabel: string;
	toLabel: string;
	learnMore: string;
	submit: string;
}

const getSyncConfig = ( type: 'pull' | 'push' ): SyncConfig => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
				syncFrom: 'production',
				syncTo: 'staging',
			},
			production: {
				title: __( 'Pull from Staging' ),
				description: __(
					'Pulling will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
				syncFrom: 'staging',
				syncTo: 'production',
			},
			fromLabel: __( 'Pull' ),
			toLabel: __( 'To' ),
			learnMore: __( 'Read more about <a>environment pull</a>.' ),
			submit: __( 'Pull' ),
		};
	}

	return {
		staging: {
			title: __( 'Push to Production' ),
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
			syncFrom: 'staging',
			syncTo: 'production',
		},
		production: {
			title: __( 'Push to Staging' ),
			description: __(
				'Pushing will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
			syncFrom: 'production',
			syncTo: 'staging',
		},
		fromLabel: __( 'Push' ),
		toLabel: __( 'To' ),
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

function SyncModal( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
	onSyncStart,
}: SyncModalProps ) {
	const dispatch = useDispatch();
	const syncConfig = getSyncConfig( syncType );
	const [ isFileBrowserVisible, setIsFileBrowserVisible ] = useState( false );
	const [ domainConfirmation, setDomainConfirmation ] = useState( '' );
	const { fileBrowserState } = useFileBrowserContext();

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const productionSiteSlug =
		useSelector( ( state ) => getSiteSlug( state, productionSiteId ) ) || '';
	const stagingSiteSlug = useSelector( ( state ) => getSiteSlug( state, stagingSiteId ) ) || '';

	const productionSiteTitle =
		useSelector( ( state ) => getSiteTitle( state, productionSiteId ) ) || '';
	const stagingSiteTitle = useSelector( ( state ) => getSiteTitle( state, stagingSiteId ) ) || '';

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;

	const sourceSiteTitle = sourceEnvironment === 'staging' ? stagingSiteTitle : productionSiteTitle;
	const targetSiteTitle =
		targetEnvironment === 'production' ? productionSiteTitle : stagingSiteTitle;

	const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;
	const getDisplayDate = useGetDisplayDate( querySiteId );

	const { backupAttempt: lastKnownBackupAttempt, isLoading: isLoadingBackupAttempt } =
		useFirstMatchingBackupAttempt( querySiteId, {
			sortOrder: 'desc',
			successOnly: true,
		} );
	const rewindId = lastKnownBackupAttempt?.rewindId ?? 0;

	const browserCheckList = fileBrowserState.getCheckList( rewindId );

	// Calculate checkbox state based only on visible nodes (wp-content and wp-config.php)
	const wpContentNode = fileBrowserState.getNode( WP_CONTENT_PATH, rewindId );
	const wpConfigNode = fileBrowserState.getNode( WP_CONFIG_PATH, rewindId );
	const sqlNode = fileBrowserState.getNode( SQL_PATH, rewindId );

	const isSiteWooStore = !! useSelector( ( state ) => isSiteStore( state, querySiteId ) );
	const querySiteSlug = useSelector( ( state ) => getSiteSlug( state, querySiteId ) ) as string;
	const filesAndFoldersNodesCheckState = useMemo( () => {
		const nodes = [ wpContentNode, wpConfigNode ].filter( Boolean );
		if ( nodes.length === 0 ) {
			// If nodes don't exist yet, default to 'unchecked' since we set the root to unchecked by default
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

	const handleClose = useCallback( () => {
		fileBrowserState.setNodeCheckState( WP_ROOT_PATH, 'unchecked', rewindId );
		onClose();
	}, [ fileBrowserState, onClose, rewindId ] );

	const pullMutation = useMutation( pullFromStagingMutation( productionSiteId, stagingSiteId ) );
	const pushMutation = useMutation( pushToStagingMutation( productionSiteId, stagingSiteId ) );

	const displayBackupDate = lastKnownBackupAttempt
		? getDisplayDate( lastKnownBackupAttempt.activityTs, false )
		: null;

	const shouldDisableGranularSync = ! lastKnownBackupAttempt && ! isLoadingBackupAttempt;

	const hasWarning = shouldDisableGranularSync || sqlNode?.checkState === 'checked';

	useEffect( () => {
		if ( shouldDisableGranularSync ) {
			// Ensure all content and database are marked as selected in state when granular sync is disabled
			fileBrowserState.setNodeCheckState( WP_CONTENT_PATH, 'checked', rewindId );
			fileBrowserState.setNodeCheckState( WP_CONFIG_PATH, 'checked', rewindId );
			fileBrowserState.setNodeCheckState( SQL_PATH, 'checked', rewindId );
		}
	}, [ shouldDisableGranularSync, fileBrowserState, rewindId ] );

	const handleConfirm = () => {
		let include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		let exclude_paths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );
		if (
			shouldDisableGranularSync ||
			( filesAndFoldersNodesCheckState === 'checked' && sqlNode?.checkState === 'checked' )
		) {
			// Sync everything
			include_paths = '';
			exclude_paths = '';
		}

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			pullMutation.mutate(
				{ types: 'paths', include_paths, exclude_paths },
				{
					onSuccess: () => {
						onSyncStart();
						handleClose();
						dispatch(
							recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success', {
								types: 'paths',
								include_paths,
								exclude_paths,
							} )
						);
					},
					onError: ( error: SyncError ) => {
						dispatch(
							recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
								code: error.code,
								types: 'paths',
								include_paths,
								exclude_paths,
							} )
						);
					},
				}
			);
		} else {
			pushMutation.mutate(
				{ types: 'paths', include_paths, exclude_paths },
				{
					onSuccess: () => {
						onSyncStart();
						handleClose();
						dispatch(
							recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success', {
								types: 'paths',
								include_paths,
								exclude_paths,
							} )
						);
					},
					onError: ( error: SyncError ) => {
						dispatch(
							recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
								code: error.code,
								types: 'paths',
								include_paths,
								exclude_paths,
							} )
						);
					},
				}
			);
		}
	};

	const updateFilesAndFoldersCheckState = useCallback(
		( checkState: 'checked' | 'unchecked' | 'mixed' ) => {
			fileBrowserState.setNodeCheckState( WP_CONTENT_PATH, checkState, rewindId );
			fileBrowserState.setNodeCheckState( WP_CONFIG_PATH, checkState, rewindId );
		},
		[ fileBrowserState, rewindId ]
	);

	const handleDomainConfirmation = useCallback(
		( value: string | undefined ) => setDomainConfirmation( value || '' ),
		[]
	);

	const onCheckboxChange = () => {
		updateFilesAndFoldersCheckState(
			filesAndFoldersNodesCheckState === 'checked' ? 'unchecked' : 'checked'
		);
	};

	const handleDatabaseCheckboxChange = () => {
		if ( sqlNode?.checkState === 'checked' ) {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'unchecked', rewindId );
		} else {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'checked', rewindId );
		}
	};

	const handleExpanderChange = ( value: string ) => {
		const isExpanded = value === 'true';
		setIsFileBrowserVisible( isExpanded );

		if ( ! isExpanded ) {
			// When switching to "All files and folders", reset individual selections
			updateFilesAndFoldersCheckState( 'unchecked' );
		}
	};

	const showWooCommerceWarning =
		isSiteWooStore && targetEnvironment === 'production' && sqlNode?.checkState === 'checked';

	const showDomainConfirmation = targetEnvironment === 'production' && ! isLoadingBackupAttempt;

	const calculateWarningPaddingBottom = useCallback( () => {
		const basePadding = showDomainConfirmation ? '130px' : '40px';

		let extraPadding = '0px';
		if ( hasWarning ) {
			if ( isFileBrowserVisible && showWooCommerceWarning ) {
				extraPadding = '180px';
			} else if ( isFileBrowserVisible ) {
				extraPadding = '110px';
			} else if ( showWooCommerceWarning ) {
				extraPadding = '180px';
			} else {
				extraPadding = '120px';
			}
		}

		return `calc(${ basePadding } + ${ extraPadding })`;
	}, [ showDomainConfirmation, hasWarning, isFileBrowserVisible, showWooCommerceWarning ] );

	// Allow button if there is no backup if the confirmation passes
	// regardless of browserCheckList
	const isButtonDisabled =
		( showDomainConfirmation && domainConfirmation !== productionSiteSlug ) ||
		( browserCheckList.totalItems === 0 &&
			browserCheckList.includeList.length === 0 &&
			lastKnownBackupAttempt ) ||
		pullMutation.isPending ||
		pushMutation.isPending;

	return (
		<Modal
			title={ syncConfig[ environment ].title }
			onRequestClose={ handleClose }
			style={ { maxWidth: '668px' } }
		>
			<QueryRewindState siteId={ querySiteId } />
			<VStack
				spacing={ 5 }
				style={ {
					paddingBottom: calculateWarningPaddingBottom(),
				} }
			>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/activity-log/${ targetSiteSlug }` } children={ null } />,
					} ) }
				</Text>
				<HStack spacing={ 4 } alignment="left">
					<EnvironmentLabel
						label={ syncConfig.fromLabel }
						environmentType={ sourceEnvironment }
						siteTitle={ sourceSiteTitle }
					/>
					<DirectionArrow />
					<EnvironmentLabel
						label={ syncConfig.toLabel }
						environmentType={ targetEnvironment }
						siteTitle={ targetSiteTitle }
					/>
				</HStack>

				<div
					className={ clsx( 'staging-site-card', {
						'confirmation-input': showDomainConfirmation,
						'has-warning': hasWarning,
						'has-file-browser': isFileBrowserVisible,
						'has-woocommerce-warning': showWooCommerceWarning,
					} ) }
				>
					<Tooltip
						text={
							/* Tooltip.text is string-only. We need a visible line break; "\n" won't render
							 * in this tooltip. Using <br/> requires createInterpolateElement, which returns
							 * a React element, so we cast to string as a pragmatic workaround. Keeping <br/>
							 * inside __() preserves a single translatable message. */
							( shouldDisableGranularSync
								? ( createInterpolateElement(
										__(
											'Selecting individual items to sync will be enabled automatically once your first backup is complete.<br/>Wait a few minutes or run a full sync in the meantime.'
										),
										{ br: <br /> }
								  ) as unknown as string )
								: '' ) as string
						}
						placement="top-start"
					>
						<div>
							<HStack spacing={ 2 } justify="space-between" alignment="center">
								{ isLoadingBackupAttempt ? (
									<div className="file-browser-node__loading placeholder" />
								) : (
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ __( 'Files and folders' ) }
										disabled={ shouldDisableGranularSync }
										checked={
											shouldDisableGranularSync || filesAndFoldersNodesCheckState === 'checked'
										}
										indeterminate={ filesAndFoldersNodesCheckState === 'mixed' }
										onChange={ onCheckboxChange }
									/>
								) }
								<SelectControl
									value={ isFileBrowserVisible ? 'true' : 'false' }
									variant="minimal"
									disabled={ shouldDisableGranularSync }
									options={ [
										{
											label: __( 'All files and folders' ),
											value: 'false',
										},
										{
											label: __( 'Specific files and folders' ),
											value: 'true',
										},
									] }
									onChange={ handleExpanderChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									aria-label={ __( 'Select files and folders to sync' ) }
								/>
							</HStack>
							{ /*
							 * Keep the FileBrowser component rendered (using a CSS 'hidden' class instead of conditional rendering)
							 * to ensure its child nodes initialize properly and can be selected by default.
							 */ }
							<div className={ isFileBrowserVisible ? '' : 'hidden' }>
								<FileBrowser
									rewindId={ rewindId }
									siteId={ querySiteId }
									siteSlug={ querySiteSlug }
									fileBrowserConfig={ fileBrowserConfig }
									displayBackupDate={ displayBackupDate }
								/>
							</div>
							<HStack
								alignment="left"
								spacing={ 2 }
								style={ {
									borderTop: '1px solid var(--wp-components-color-gray-300, #ddd)',
									borderBottom: '1px solid var(--wp-components-color-gray-300, #ddd)',
									padding: '16px 0',
									marginTop: '8px',
								} }
							>
								{ isLoadingBackupAttempt ? (
									<div className="file-browser-node__loading placeholder" />
								) : (
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ __( 'Database' ) }
										disabled={ shouldDisableGranularSync }
										checked={ hasWarning }
										onChange={ handleDatabaseCheckboxChange }
									/>
								) }
							</HStack>
						</div>
					</Tooltip>
				</div>
				<VStack className="staging-site-card__footer" spacing={ 6 }>
					{ hasWarning && (
						<VStack>
							<Notice status="warning" isDismissible={ false }>
								<Text as="p" weight="bold" style={ { lineHeight: '24px' } }>
									{ __( 'Warning! Database will be overwritten.' ) }
								</Text>
								<Text as="p">
									{ __(
										'Selecting database option will overwrite the site database, including any posts, pages, products, or orders.'
									) }
								</Text>
								{ showWooCommerceWarning && (
									<Text as="p" style={ { marginTop: '16px' } }>
										{ createInterpolateElement(
											__(
												'This site also has WooCommerce installed. We do not recommend syncing or pushing data from a staging site to live production news sites or sites that use eCommerce plugins. <a>Learn more</a>'
											),
											{
												a: (
													<ExternalLink
														href="https://developer.wordpress.com/docs/developer-tools/staging-sites/sync-staging-production/#staging-to-production"
														children={ null }
													/>
												),
											}
										) }
									</Text>
								) }
							</Notice>
						</VStack>
					) }
					{ showDomainConfirmation && (
						<InputControl
							__next40pxDefaultSize
							label={
								<HStack style={ { textTransform: 'none' } } alignment="left" spacing={ 1 }>
									<Text>
										{ __( 'Enter your site‘s name' ) }{ ' ' }
										<Text color="var(--studio-red-50)">{ productionSiteSlug }</Text>{ ' ' }
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
							<Text className="staging-site-card__footer-text">
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

						<HStack justify="flex-end" spacing={ 4 }>
							<Button variant="tertiary" onClick={ handleClose }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ handleConfirm }
								isBusy={ pullMutation.isPending || pushMutation.isPending }
								disabled={ isButtonDisabled }
							>
								{ syncConfig.submit }
							</Button>
						</HStack>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}

// Wrapper component to provide FileBrowser context
export default function SyncModalWrapper( props: SyncModalProps ) {
	const locale = useLocale();
	const dispatch = useDispatch();
	const notices = {
		showError: ( message: string ) => dispatch( errorNotice( message ) ),
		showSuccess: ( message: string ) => dispatch( successNotice( message ) ),
	};

	return (
		<FileBrowserProvider locale={ locale } notices={ notices }>
			<SyncModal { ...props } />
		</FileBrowserProvider>
	);
}
