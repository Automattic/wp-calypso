import { Button, Card, Gridicon } from '@automattic/components';
import { Button as WordPressButton } from '@wordpress/components';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { Icon, arrowLeft, backup, chevronDown, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindGranularRestore } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import {
	BackupBrowserSelectedItem,
	BackupBrowserItemType,
} from 'calypso/state/rewind/browser/types';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserSelectedList from 'calypso/state/rewind/selectors/get-backup-browser-selected-list';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { backupContentsPath } from '../paths';
import Error from './error';
import GranularRestoreLoading from './loading-placeholder/granular-restore';
import ProgressBar from './progress-bar';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';

interface Props {
	backupDisplayDate: string;
	rewindId: string;
	siteId: number;
	siteUrl: string;
}

const BackupGranularRestoreFlow: FunctionComponent< Props > = ( {
	backupDisplayDate,
	rewindId,
	siteId,
	siteUrl,
} ) => {
	const fileDisplayLimit = 10;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const refreshBackups = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const [ showFiles, setShowFiles ] = useState( true );
	const [ showAllFiles, setShowAllFiles ] = useState( false );
	const [ showTables, setShowTables ] = useState( true );
	const [ showAllTables, setShowAllTables ] = useState( false );
	const [ showThemes, setShowThemes ] = useState( true );
	const [ showAllThemes, setShowAllThemes ] = useState( false );
	const [ showPlugins, setShowPlugins ] = useState( true );
	const [ showAllPlugins, setShowAllPlugins ] = useState( false );
	const expandClick = ( type: BackupBrowserItemType, toggleAll: boolean ) => {
		if ( toggleAll ) {
			switch ( type ) {
				case 'file':
					setShowAllFiles( ! showAllFiles );
					break;
				case 'theme':
					setShowAllThemes( ! showAllThemes );
					break;
				case 'plugin':
					setShowAllPlugins( ! showAllPlugins );
					break;
				case 'table':
					setShowAllTables( ! showAllTables );
					break;
				default:
					break;
			}
		} else {
			switch ( type ) {
				case 'file':
					if ( showFiles ) {
						setShowAllFiles( false );
					}
					setShowFiles( ! showFiles );
					break;
				case 'theme':
					if ( showThemes ) {
						setShowAllThemes( false );
					}
					setShowThemes( ! showThemes );
					break;
				case 'plugin':
					if ( showPlugins ) {
						setShowAllPlugins( false );
					}
					setShowPlugins( ! showPlugins );
					break;
				case 'table':
					if ( showTables ) {
						setShowAllTables( false );
					}
					setShowTables( ! showTables );
					break;
				default:
					break;
			}
		}
	};
	const renderExpandIcon = ( type: BackupBrowserItemType ) => {
		switch ( type ) {
			case 'table':
				return <Icon icon={ showTables ? chevronDown : chevronRight } />;
			case 'plugin':
				return <Icon icon={ showPlugins ? chevronDown : chevronRight } />;
			case 'theme':
				return <Icon icon={ showThemes ? chevronDown : chevronRight } />;
			case 'file':
				return <Icon icon={ showFiles ? chevronDown : chevronRight } />;
		}
	};

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const areCredentialsInvalid = useSelector( ( state ) =>
		areJetpackCredentialsInvalid( state, siteId, 'main' )
	);

	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState( false );

	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) ) as RewindState;
	const inProgressRewindStatus = useSelector( ( state ) =>
		getInProgressRewindStatus( state, siteId, rewindId )
	);
	const { message, percent, currentEntry, status } = useSelector(
		( state ) => getRestoreProgress( state, siteId ) || ( {} as RestoreProgress )
	);

	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );
	const browserSelectedList = useSelector( ( state ) =>
		getBackupBrowserSelectedList( state, siteId )
	);
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		if ( rewindState.state === 'uninitialized' ) {
			setLoading( true );
		}

		setLoading( false );
	}, [ rewindState ] );

	const onConfirm = useCallback( () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );
		dispatch( setValidFrom( 'restore', Date.now() ) );
		setUserHasRequestedRestore( true );

		// Given that it may take some time for the restore to queue/start, let's add a loading state
		// It will be removed once the restore is officially queued
		setLoading( true );

		dispatch( rewindGranularRestore( siteId, rewindId, includePaths, excludePaths ) );

		dispatch( recordTracksEvent( 'calypso_jetpack_granular_restore_confirm' ) );
	}, [ browserCheckList.excludeList, browserCheckList.includeList, dispatch, rewindId, siteId ] );

	const onCancel = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_granular_restore_cancel' ) );
	}, [ dispatch ] );

	const onGoBack = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_granular_restore_goback' ) );
	}, [ dispatch ] );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const { restoreId } = rewindState.rewind || {};

	const disableRestore = ! isAtomic && areCredentialsInvalid;

	const goBackUrl = backupContentsPath( siteSlug as string, rewindId );

	const showAllType = ( type: BackupBrowserItemType ): boolean => {
		switch ( type ) {
			case 'file':
				return showAllFiles;
			case 'theme':
				return showAllThemes;
			case 'plugin':
				return showAllPlugins;
			case 'table':
				return showAllTables;
		}
	};

	const showType = ( type: BackupBrowserItemType ): boolean => {
		switch ( type ) {
			case 'file':
				return showFiles;
			case 'theme':
				return showThemes;
			case 'plugin':
				return showPlugins;
			case 'table':
				return showTables;
		}
	};

	const getTypeLabel = ( type: BackupBrowserItemType, allSelected: boolean ) => {
		switch ( type ) {
			case 'file':
				return translate( 'Files and directories' );
			case 'theme':
				return allSelected
					? translate( 'All site themes will be restored' )
					: translate( 'WordPress Themes' );
			case 'plugin':
				return allSelected
					? translate( 'All site plugins will be restored' )
					: translate( 'WordPress Plugins' );
			case 'table':
				return allSelected
					? translate( 'All site database tables will be restored' )
					: translate( 'Site Databases' );
		}
	};

	const renderSection = ( type: BackupBrowserItemType ) => {
		// Trim the list down to only the specified type
		// For files, exclude the directories for the other types
		const items = browserSelectedList.filter( ( item ) => {
			return (
				item.type === type &&
				! [ '/sql', '/wp-content/plugins', '/wp-content/themes' ].includes( item.path )
			);
		} );
		if ( items.length === 0 ) {
			if ( type === 'file' ) {
				return null;
			}
			let allItemsSelectedPath = '';
			switch ( type ) {
				case 'theme':
					allItemsSelectedPath = '/wp-content/themes';
					break;
				case 'plugin':
					allItemsSelectedPath = '/wp-content/plugins';
					break;
				case 'table':
					allItemsSelectedPath = '/sql';
					break;
			}
			if (
				browserSelectedList.some( ( item ) => {
					if ( item.path === allItemsSelectedPath || item.path === '/' ) {
						return true;
					}
					// Plugins and themes will all be included if the wp-content directory is selected
					if ( 'table' !== type ) {
						return item.path === '/wp-content';
					}
				} )
			) {
				return (
					<>
						<h4 className="rewind-flow__cta">{ getTypeLabel( type, true ) }</h4>
					</>
				);
			}
			return null;
		}
		let displayItems: BackupBrowserSelectedItem[] = [];
		let extendedItems: BackupBrowserSelectedItem[] = [];
		if ( items.length > fileDisplayLimit ) {
			displayItems = items.slice( 0, fileDisplayLimit );
			extendedItems = items.slice( fileDisplayLimit );
		} else {
			displayItems = items;
		}

		return (
			<>
				<h4 className="rewind-flow__cta">
					<WordPressButton variant="link" onClick={ () => expandClick( type, false ) }>
						{ getTypeLabel( type, false ) } { renderExpandIcon( type ) }
					</WordPressButton>
				</h4>
				{ showType( type ) && (
					<ul className="rewind-flow__files">
						{ displayItems.map( ( item ) => (
							<li key={ item.path }>{ item.path }</li>
						) ) }
					</ul>
				) }
				{ extendedItems.length > 0 && showType( type ) && (
					<div className="rewind-flow__expandable-files">
						{ ! showAllType( type ) && (
							<WordPressButton
								variant="link"
								className="rewind-flow__show-all"
								onClick={ () => expandClick( type, true ) }
							>
								{ translate(
									'%(numberOfFiles)d more file or directory selected',
									'%(numberOfFiles)d more files or directories selected',
									{
										count: extendedItems.length,
										args: { numberOfFiles: extendedItems.length },
									}
								) }
							</WordPressButton>
						) }
						{ showAllType( type ) && (
							<ul className="rewind-flow__files">
								{ extendedItems.map( ( item ) => (
									<li key={ item.path }>{ item.path }</li>
								) ) }
							</ul>
						) }
					</div>
				) }
			</>
		);
	};

	const renderConfirm = () => (
		<>
			{ ! isAtomic && <QueryJetpackCredentialsStatus siteId={ siteId } role="main" /> }
			<div className="rewind-flow__header">
				<Icon icon={ backup } size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Restore files' ) }</h3>
			<p className="rewind-flow__info">
				{ translate(
					'{{strong}}%(backupDisplayDate)s{{/strong}} is the selected point for your restore. ',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			{ renderSection( 'theme' ) }
			{ renderSection( 'plugin' ) }
			{ renderSection( 'table' ) }
			{ renderSection( 'file' ) }
			<RewindFlowNotice
				gridicon="notice"
				title={ translate( 'Restoring will override and remove all content after this point.' ) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<>
				{ backupCurrentlyInProgress && (
					<RewindFlowNotice
						gridicon="notice"
						title={ translate(
							'A backup is currently in progress; restoring now will stop the backup.'
						) }
						type={ RewindFlowNoticeLevel.WARNING }
					/>
				) }
			</>
			<div className="rewind-flow__btn-group">
				<Button className="rewind-flow__back-button" href={ goBackUrl } onClick={ onCancel }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					className="rewind-flow__primary-button"
					primary
					onClick={ onConfirm }
					disabled={ disableRestore }
				>
					{ translate( 'Confirm restore' ) }
				</Button>
			</div>
			<Interval onTick={ refreshBackups } period={ EVERY_FIVE_SECONDS } />
		</>
	);

	const renderInProgress = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar
				isReady={ 'running' === status }
				initializationMessage={ translate( 'Initializing the restore process' ) }
				message={ message }
				entry={ currentEntry }
				percent={ percent }
			/>
			<p className="rewind-flow__info">
				{ translate(
					'We are restoring your site back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<CheckYourEmail
				message={ translate(
					"Don't want to wait? For your convenience, we'll email you when your site has been fully restored."
				) }
			/>
		</>
	);

	const renderFinished = () => (
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-restore-success.svg"
					alt="jetpack cloud restore success"
				/>
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'Your site has been successfully restored.' ) }
			</h3>
			<p className="rewind-flow__info">
				{ translate(
					'All of your selected items are now restored back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Button primary href={ siteUrl } className="rewind-flow__primary-button">
				{ translate( 'View your website' ) }
			</Button>
		</>
	);

	const renderError = () => (
		<Error
			errorText={ translate( 'Restore failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
			siteUrl={ siteUrl }
		>
			<p className="rewind-flow__info">
				{ translate(
					'An error occurred while restoring your site. Please {{button}}try your restore again{{/button}} or contact our support team to resolve the issue.',
					{
						components: {
							button: <Button className="rewind-flow__error-retry-button" onClick={ onConfirm } />,
						},
					}
				) }
			</p>
		</Error>
	);

	const isInProgress =
		( ! inProgressRewindStatus && userHasRequestedRestore ) ||
		( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) );
	const isFinished = inProgressRewindStatus !== null && inProgressRewindStatus === 'finished';

	const shouldRenderConfirmation = ( ! isInProgress || ! isFinished ) && ! userHasRequestedRestore;

	useEffect( () => {
		if ( isInProgress && ! userHasRequestedRestore ) {
			setUserHasRequestedRestore( true );
		}
	}, [ inProgressRewindStatus, isInProgress, userHasRequestedRestore ] );

	const render = () => {
		if ( loading ) {
			return <GranularRestoreLoading />;
		} else if ( shouldRenderConfirmation ) {
			return renderConfirm();
		} else if ( isInProgress ) {
			return renderInProgress();
		} else if ( isFinished ) {
			return renderFinished();
		}
		return renderError();
	};

	return (
		<>
			<QueryRewindBackups siteId={ siteId } />
			<QueryRewindState siteId={ siteId } />
			{ restoreId && 'running' === inProgressRewindStatus && (
				<QueryRewindRestoreStatus siteId={ siteId } restoreId={ restoreId } />
			) }
			<WordPressButton
				variant="link"
				className="backup-contents-page__back-button is-borderless"
				href={ goBackUrl }
				onClick={ onGoBack }
			>
				<Icon icon={ arrowLeft } size={ 16 } /> { translate( 'Go Back' ) }
			</WordPressButton>
			<Card className="granular-restore">{ render() }</Card>
			{ ( isInProgress || isFinished ) && <JetpackReviewPrompt align="center" type="restore" /> }
		</>
	);
};

export default BackupGranularRestoreFlow;
