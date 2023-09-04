import { Button, Card, Gridicon } from '@automattic/components';
import { Icon, Button as WordPressButton } from '@wordpress/components';
import { arrowLeft, backup, chevronDown, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
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
import Loading from './loading';
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
	const dispatch = useDispatch();
	const translate = useTranslate();

	const refreshBackups = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const [ showAllFiles, setShowAllFiles ] = useState< boolean >( false );
	const expandClick = () => {
		setShowAllFiles( ! showAllFiles );
	};

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const areCredentialsInvalid = useSelector( ( state ) =>
		areJetpackCredentialsInvalid( state, siteId, 'main' )
	);

	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );

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

	const onConfirm = useCallback( () => {
		// Let's see what the browser check list looks like
		// eslint-disable-next-line no-console
		console.log( browserCheckList );
		// eslint-disable-next-line no-console
		console.log( browserSelectedList );
		return;

		dispatch( setValidFrom( 'restore', Date.now() ) );
		setUserHasRequestedRestore( true );
	}, [ browserCheckList, browserSelectedList, dispatch, setUserHasRequestedRestore ] );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const loading = rewindState.state === 'uninitialized';
	const { restoreId } = rewindState.rewind || {};

	const disableRestore = ! isAtomic && areCredentialsInvalid;

	const goBackUrl = backupContentsPath( siteSlug as string, rewindId );

	const renderThemes = () => {
		const themes = browserSelectedList.filter( ( item ) => item.type === 'theme' );
		if ( themes.length === 0 ) {
			return null;
		}
		return (
			<>
				<h4 className="rewind-flow__cta">{ translate( 'WordPress themes' ) }</h4>
				<ul className="rewind-flow__files">
					{ themes.map( ( item ) => (
						<li key={ item.path }>{ item.path }</li>
					) ) }
				</ul>
			</>
		);
	};

	const renderPlugins = () => {
		const plugins = browserSelectedList.filter( ( item ) => item.type === 'plugin' );
		if ( plugins.length === 0 ) {
			return null;
		}
		return (
			<>
				<h4 className="rewind-flow__cta">{ translate( 'WordPress plugins' ) }</h4>
				<ul className="rewind-flow__files">
					{ plugins.map( ( item ) => (
						<li key={ item.path }>{ item.path }</li>
					) ) }
				</ul>
			</>
		);
	};

	const renderTables = () => {
		const tables = browserSelectedList.filter( ( item ) => item.type === 'table' );
		if ( tables.length === 0 ) {
			return null;
		}
		return (
			<>
				<h4 className="rewind-flow__cta">{ translate( 'Site database' ) }</h4>
				<ul className="rewind-flow__files">
					{ tables.map( ( item ) => (
						<li key={ item.path }>{ item.path }</li>
					) ) }
				</ul>
			</>
		);
	};

	const renderExpandIcon = () => {
		return <Icon icon={ showAllFiles ? chevronDown : chevronRight } />;
	};

	const renderFiles = () => {
		const files = browserSelectedList.filter( ( item ) => item.type === 'file' );
		if ( files.length === 0 ) {
			return null;
		}

		return (
			<>
				<div className="rewind-flow__cta rewind-flow__expandable">
					<Button className="rewind-flow__cta" onClick={ expandClick }>
						{ files.length + translate( ' more files selected' ) }
						{ renderExpandIcon() }
					</Button>
				</div>
				{ showAllFiles && (
					<ul className="rewind-flow__files">
						{ files.map( ( item ) => (
							<li key={ item.path }>{ item.path }</li>
						) ) }
					</ul>
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
			{ renderThemes() }
			{ renderPlugins() }
			{ renderTables() }
			{ renderFiles() }
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
				<Button className="rewind-flow__back-button" href={ goBackUrl }>
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

	const render = () => {
		if ( loading ) {
			return <Loading />;
		} else if ( ! inProgressRewindStatus && ! userHasRequestedRestore ) {
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
			>
				<Icon icon={ arrowLeft } size={ 16 } /> { translate( 'Go Back' ) }
			</WordPressButton>
			<Card className="granular-restore">{ render() }</Card>
			{ ( isInProgress || isFinished ) && <JetpackReviewPrompt align="center" type="restore" /> }
		</>
	);
};

export default BackupGranularRestoreFlow;
