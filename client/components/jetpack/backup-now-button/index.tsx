import { Button, Tooltip } from '@wordpress/components';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindBackupSite } from 'calypso/state/activity-log/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getBackupStoppedFlag from 'calypso/state/rewind/selectors/get-backup-stopped-flag';

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
	const inProgressText = translate( 'Backup Queued' );
	const requestBackupSite = useCallback(
		() => dispatch( rewindBackupSite( siteId ) ),
		[ dispatch, siteId ]
	);
	const trackedRequestBackupSite = useTrackCallback( requestBackupSite, trackEventName );
	const enqueueBackup = () => {
		trackedRequestBackupSite();
		setDisabled( true );
		setEnqueued( true );
	};
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	useEffect( () => {
		if ( areBackupsStopped ) {
			setCurrentTooltip( translate( 'Cannot queue backups due to reaching storage limits.' ) );
		} else if ( backupCurrentlyInProgress || enqueued ) {
			setCurrentTooltip( translate( 'A backup is currently in progress.' ) );
			setButtonContent( inProgressText );
		} else {
			setCurrentTooltip( tooltipText );
		}
	}, [
		areBackupsStopped,
		backupCurrentlyInProgress,
		tooltipText,
		translate,
		inProgressText,
		enqueued,
	] );

	// TODO: If we want to re-enable the backup button we can set enqueue to false once we detect a backup in progress

	const button = (
		<div>
			{ /* Wrapped in a div to avoid disabled button blocking hover events from reaching Tooltip */ }
			<Button
				variant={ variant }
				onClick={ enqueueBackup }
				disabled={ backupCurrentlyInProgress || areBackupsStopped || disabled }
			>
				{ buttonContent }
			</Button>
		</div>
	);

	return <>{ currentTooltip ? <Tooltip text={ currentTooltip }>{ button }</Tooltip> : button }</>;
};

export default BackupNowButton;
