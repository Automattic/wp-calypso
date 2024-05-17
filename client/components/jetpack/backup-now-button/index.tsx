import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { recordLogRocketEvent } from 'calypso/lib/analytics/logrocket';
import { EVERY_SECOND, Interval } from 'calypso/lib/interval';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindBackupSite } from 'calypso/state/activity-log/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getBackupStoppedFlag from 'calypso/state/rewind/selectors/get-backup-stopped-flag';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

interface Props {
	children?: React.ReactNode;
	siteId: number;
	tooltipText?: string;
	trackEventName: string;
	variant: 'primary' | 'secondary' | 'tertiary';
}

const BackupNowButton: FunctionComponent< Props > = ( {
	children,
	siteId,
	tooltipText,
	trackEventName,
	variant,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const areBackupsStopped = useSelector( ( state ) => getBackupStoppedFlag( state, siteId ) );
	const [ disabled, setDisabled ] = useState( false );
	const [ buttonContent, setButtonContent ] = useState( children );
	const [ currentTooltip, setCurrentTooltip ] = useState( tooltipText );
	const [ enqueued, setEnqueued ] = useState( false );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const requestBackupSite = useCallback(
		() => dispatch( rewindBackupSite( siteId ) ),
		[ dispatch, siteId ]
	);
	const trackedRequestBackupSite = useTrackCallback( requestBackupSite, trackEventName );
	const enqueueBackup = () => {
		trackedRequestBackupSite();
		recordLogRocketEvent( trackEventName );
		setDisabled( true );
		setEnqueued( true );
	};
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const refreshBackupProgress = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);

	useEffect( () => {
		const statusLabels = {
			QUEUED: translate( 'Backup queued' ),
			IN_PROGRESS: translate( 'Backup in progress' ),
		};

		const statusTooltipTexts = {
			QUEUED: translate( 'A backup has been queued and will start shortly.' ),
			IN_PROGRESS: translate( 'A backup is currently in progress.' ),
		};

		if ( areBackupsStopped ) {
			setCurrentTooltip( translate( 'Cannot queue backups due to reaching storage limits.' ) );
		} else if ( backupCurrentlyInProgress ) {
			setCurrentTooltip( statusTooltipTexts.IN_PROGRESS );
			setButtonContent( statusLabels.IN_PROGRESS );
			setEnqueued( false );
		} else if ( enqueued ) {
			page( backupMainPath( siteSlug ) );
			setButtonContent( statusLabels.QUEUED );
			setCurrentTooltip( statusTooltipTexts.QUEUED );
		} else {
			setButtonContent( children );
			setCurrentTooltip( tooltipText );
			setDisabled( false );
		}
	}, [
		areBackupsStopped,
		backupCurrentlyInProgress,
		tooltipText,
		translate,
		enqueued,
		children,
		siteSlug,
	] );

	const button = (
		<div>
			{ /* Wrapped in a div to avoid disabled button blocking hover events from reaching Tooltip */ }
			<Button
				primary={ variant === 'primary' }
				plain={ variant === 'tertiary' }
				onClick={ enqueueBackup }
				disabled={ backupCurrentlyInProgress || areBackupsStopped || disabled }
			>
				{ buttonContent }
			</Button>
		</div>
	);

	return (
		<>
			{ currentTooltip ? <Tooltip text={ currentTooltip }>{ button }</Tooltip> : button }
			{ enqueued && ! backupCurrentlyInProgress && (
				<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
			) }
		</>
	);
};

export default BackupNowButton;
