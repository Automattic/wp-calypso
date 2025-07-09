import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { useSelector, useDispatch } from 'react-redux';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import InlineSupportLink from 'calypso/dashboard/components/inline-support-link';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import SiteEnvironmentBadge, {
	EnvironmentType,
} from 'calypso/dashboard/components/site-environment-badge';
import FileBrowser from 'calypso/my-sites/backup/backup-contents-page/file-browser';
import { useFirstMatchingBackupAttempt } from 'calypso/my-sites/backup/hooks';
import { usePullFromStagingMutation } from 'calypso/sites/staging-site/hooks/use-staging-sync';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import { getSiteSlug } from 'calypso/state/sites/selectors';

// TODO: Temporary style for the PoC
import './style.scss';

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
}

const EnvironmentLabel = ( { label, environmentType }: EnvironmentLabelProps ) => {
	return (
		<VStack spacing={ 1 } style={ { flex: 1 } }>
			<SectionHeader level={ 3 } title={ label } />
			<InputControl
				readOnly
				prefix={
					<InputControlPrefixWrapper>
						<SiteEnvironmentBadge environmentType={ environmentType } />
					</InputControlPrefixWrapper>
				}
				__next40pxDefaultSize
				tabIndex={ -1 }
				aria-hidden="true"
			/>
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

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const productionSiteSlug =
		useSelector( ( state ) => getSiteSlug( state, productionSiteId ) ) ?? '';
	const stagingSiteSlug = useSelector( ( state ) => getSiteSlug( state, stagingSiteId ) ) ?? '';

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;

	const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;

	const browserCheckList = useSelector( ( state ) =>
		getBackupBrowserCheckList( state, querySiteId )
	);

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

	const { backupAttempt: lastKnownBackupAttempt } = useFirstMatchingBackupAttempt( querySiteId, {
		sortOrder: 'desc',
		successOnly: true,
	} );
	const rewindId = lastKnownBackupAttempt?.rewindId;

	const handleConfirm = () => {
		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			const include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
			pullFromStaging( { types: 'paths', include_paths } );
			onClose();
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
				<HStack spacing={ 2 } alignment="center">
					<EnvironmentLabel label={ syncConfig.fromLabel } environmentType={ sourceEnvironment } />
					<DirectionArrow />
					<EnvironmentLabel label={ syncConfig.toLabel } environmentType={ targetEnvironment } />
				</HStack>
				<SectionHeader level={ 3 } title={ syncConfig.syncSelectionHeading } />
				{ querySiteId === stagingSiteId && (
					<div className="staging-site-card">
						<FileBrowser rewindId={ rewindId } showHeaderButtons={ false } siteId={ querySiteId } />
					</div>
				) }
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
