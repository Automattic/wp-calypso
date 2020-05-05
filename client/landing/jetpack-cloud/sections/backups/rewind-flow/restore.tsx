/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { defaultRewindConfig, RewindConfig } from './types';
import { rewindRestore } from 'state/activity-log/actions';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import getInProgressRewindPercentComplete from 'state/selectors/get-in-progress-rewind-percent-complete';
import getInProgressRewindStatus from 'state/selectors/get-in-progress-rewind-status';
import getRewindState from 'state/selectors/get-rewind-state';
import Gridicon from 'components/gridicon';
import ProgressBar from './progress-bar';
import QueryRewindState from 'components/data/query-rewind-state';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import Spinner from 'components/spinner';
import contactSupportUrl from 'landing/jetpack-cloud/lib/contact-support-url';

interface Props {
	backupDisplayDate: string;
	rewindId: string;
	siteId: number;
	siteUrl: string;
}

//todo: move to dedicated types file
interface RewindState {
	state: string;
	rewind?: {
		status: 'queued' | 'running' | 'finished' | 'fail';
	};
}

const BackupRestoreFlow: FunctionComponent< Props > = ( {
	backupDisplayDate,
	rewindId,
	siteId,
	siteUrl,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );

	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) ) as RewindState;

	const loading = rewindState.state === 'uninitialized';

	const inProgressRewindStatus = useSelector( ( state ) =>
		getInProgressRewindStatus( state, siteId, rewindId )
	);
	const inProgressRewindPercentComplete = useSelector( ( state ) =>
		getInProgressRewindPercentComplete( state, siteId, rewindId )
	);

	const requestRestore = useCallback(
		() => dispatch( rewindRestore( siteId, rewindId, rewindConfig ) ),
		[ dispatch, rewindConfig, rewindId, siteId ]
	);

	const onConfirm = () => {
		setUserHasRequestedRestore( true );
		requestRestore();
	};

	const renderConfirm = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Restore site' ) }</h3>
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
			<h4 className="rewind-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice"
				title={ translate( 'This will override and remove all content after this point' ) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<Button
				className="rewind-flow__primary-button"
				primary
				onClick={ onConfirm }
				disabled={ Object.values( rewindConfig ).every( ( setting ) => ! setting ) }
			>
				{ translate( 'Confirm restore' ) }
			</Button>
		</>
	);

	const renderInProgress = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar percent={ inProgressRewindPercentComplete } />
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
					'All of your selected files are now restored back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
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
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-cloud-download-failure.svg"
					alt="jetpack cloud download error"
				/>
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'An error occurred while restoring your site' ) }
			</h3>
			<Button
				className="rewind-flow__primary-button"
				href={ contactSupportUrl( siteUrl, 'error' ) }
				primary
				rel="noopener noreferrer"
				target="_blank"
			>
				{ translate( 'Contact Support {{externalIcon/}}', {
					components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
				} ) }
			</Button>
		</>
	);

	const renderLoading = () => (
		<>
			<div className="rewind-flow__header">
				<Spinner size={ 48 } />
			</div>
			<h3 className="rewind-flow__title-placeholder">{ translate( 'Loading restore status…' ) }</h3>
		</>
	);

	const render = () => {
		if ( loading ) {
			return renderLoading();
		} else if ( ! inProgressRewindStatus && ! userHasRequestedRestore ) {
			return renderConfirm();
		} else if (
			( ! inProgressRewindStatus && userHasRequestedRestore ) ||
			( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) )
		) {
			return renderInProgress();
		} else if ( inProgressRewindStatus !== null && inProgressRewindStatus === 'finished' ) {
			return renderFinished();
		}

		return renderError();
	};

	return (
		<>
			<QueryRewindState siteId={ siteId } />
			{ render() }
		</>
	);
};

export default BackupRestoreFlow;
