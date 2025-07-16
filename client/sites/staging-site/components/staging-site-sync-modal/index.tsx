import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CheckboxControl,
	SelectControl,
} from '@wordpress/components';
import { createInterpolateElement, useState, useCallback, useEffect } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import InlineSupportLink from 'calypso/dashboard/components/inline-support-link';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import SiteEnvironmentBadge, {
	EnvironmentType,
} from 'calypso/dashboard/components/site-environment-badge';
import FileBrowser from 'calypso/my-sites/backup/backup-contents-page/file-browser';
import { useFirstMatchingBackupAttempt } from 'calypso/my-sites/backup/hooks';
import {
	usePullFromStagingMutation,
	usePushToStagingMutation,
} from 'calypso/sites/staging-site/hooks/use-staging-sync';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import type { FileBrowserConfig } from 'calypso/my-sites/backup/backup-contents-page/file-browser';

// TODO: Temporary style for the PoC
import './style.scss';

const fileBrowserConfig: FileBrowserConfig = {
	restrictedTypes: [ 'plugin', 'theme' ],
	restrictedPaths: [ 'wp-content' ],
	excludeTypes: [ 'wordpress' ],
	alwaysInclude: [ 'wp-config.php' ],
	showHeaderButtons: false,
	showFileCard: false,
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
	syncSelectionHeading: string;
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
			syncSelectionHeading: __( 'What would you like to pull?' ),
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
		syncSelectionHeading: __( 'What would you like to push?' ),
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

export default function SyncModal( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
}: SyncModalProps ) {
	const dispatch = useDispatch();
	const syncConfig = getSyncConfig( syncType );
	const [ isFileBrowserVisible, setIsFileBrowserVisible ] = useState( false );

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

	const browserCheckList = useSelector( ( state ) =>
		getBackupBrowserCheckList( state, querySiteId )
	);

	// Calculate checkbox state based only on visible nodes (wp-content and wp-config.php)
	const wpContentNode = useSelector( ( state ) =>
		getBackupBrowserNode( state, querySiteId, '/wp-content' )
	);
	const wpConfigNode = useSelector( ( state ) =>
		getBackupBrowserNode( state, querySiteId, '/wp-config.php' )
	);

	const getVisibleNodesCheckState = useCallback( () => {
		const nodes = [ wpContentNode, wpConfigNode ].filter( Boolean );
		if ( nodes.length === 0 ) {
			// If nodes don't exist yet, default to 'checked' since we set the root to checked by default
			return 'checked';
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

	const visibleNodesCheckState = getVisibleNodesCheckState();

	useEffect( () => {
		if ( querySiteId === stagingSiteId ) {
			dispatch( setNodeCheckState( querySiteId, '/', 'checked' ) );
			dispatch( setNodeCheckState( querySiteId, '/wp-content', 'checked' ) );
			dispatch( setNodeCheckState( querySiteId, '/wp-config.php', 'checked' ) );
		}
	}, [ dispatch, querySiteId, stagingSiteId ] );

	const { pullFromStaging } = usePullFromStagingMutation( productionSiteId, stagingSiteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success' ) );
			// setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			// setSyncError( error.code );
		},
	} );

	const { pushToStaging } = usePushToStagingMutation( productionSiteId, stagingSiteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success' ) );
			// setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
					code: error.code,
				} )
			);
			// setSyncError( error.code );
		},
	} );

	const { backupAttempt: lastKnownBackupAttempt } = useFirstMatchingBackupAttempt( querySiteId, {
		sortOrder: 'desc',
		successOnly: true,
	} );
	const rewindId = lastKnownBackupAttempt?.rewindId;

	const handleConfirm = () => {
		let include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		if ( visibleNodesCheckState === 'checked' ) {
			// Sync everything
			include_paths = '';
		}

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			pullFromStaging( { types: 'paths', include_paths } );
		} else {
			pushToStaging( { types: 'paths', include_paths } );
		}

		onClose();
	};

	const updateNodeCheckState = useCallback(
		( checkState: 'checked' | 'unchecked' | 'mixed' ) => {
			dispatch( setNodeCheckState( querySiteId, '/', checkState ) );
		},
		[ dispatch, querySiteId ]
	);

	const onCheckboxChange = () => {
		updateNodeCheckState( visibleNodesCheckState === 'checked' ? 'unchecked' : 'checked' );
	};

	const handleExpanderChange = ( value: string ) => {
		const isExpanded = value === 'true';
		setIsFileBrowserVisible( isExpanded );

		if ( ! isExpanded ) {
			// When collapsing, select all files
			updateNodeCheckState( 'checked' );
		}
	};

	return (
		<Modal
			title={ syncConfig[ environment ].title }
			onRequestClose={ onClose }
			style={ { maxWidth: '668px' } }
		>
			<QueryRewindState siteId={ querySiteId } />
			<VStack spacing={ 6 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/backup/${ targetSiteSlug }` } children={ null } />,
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
				<SectionHeader level={ 3 } title={ syncConfig.syncSelectionHeading } />

				<div className="staging-site-card">
					<HStack spacing={ 2 } justify="space-between" alignment="center">
						<CheckboxControl
							__nextHasNoMarginBottom
							label={ __( 'Files and folders' ) }
							checked={ visibleNodesCheckState === 'checked' }
							indeterminate={ visibleNodesCheckState === 'mixed' }
							onChange={ onCheckboxChange }
						/>
						<SelectControl
							value={ isFileBrowserVisible ? 'true' : 'false' }
							variant="minimal"
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

					{ isFileBrowserVisible && (
						<FileBrowser
							rewindId={ rewindId }
							siteId={ querySiteId }
							fileBrowserConfig={ fileBrowserConfig }
						/>
					) }
				</div>
				<Text>
					{ createInterpolateElement( syncConfig.learnMore, {
						a: <InlineSupportLink onClick={ onClose } supportContext="hosting-staging-site" />,
					} ) }
				</Text>
				<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" onClick={ handleConfirm }>
						{ syncConfig.submit }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
