import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { recordLogRocketEvent } from 'calypso/lib/analytics/logrocket';
import { EVERY_SECOND, Interval } from 'calypso/lib/interval';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindBackupSite } from 'calypso/state/activity-log/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getBackupStoppedFlag from 'calypso/state/rewind/selectors/get-backup-stopped-flag';

interface Props {
	children?: React.ReactNode;
	siteId: number;
	tooltipText?: string;
	trackEventName: string;
	variant: 'primary' | 'secondary' | 'tertiary';
	onClick?: ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => void;
}

const BackupNowButton: FunctionComponent< Props > = ( {
	children,
	siteId,
	tooltipText,
	trackEventName,
	variant,
	onClick,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const areBackupsStopped = useSelector( ( state ) => getBackupStoppedFlag( state, siteId ) );
	const [ disabled, setDisabled ] = useState( false );
	const [ buttonContent, setButtonContent ] = useState( children );
	const [ currentTooltip, setCurrentTooltip ] = useState( tooltipText );
	const [ enqueued, setEnqueued ] = useState( false );
	const requestBackupSite = useCallback(
		() => dispatch( rewindBackupSite( siteId ) ),
		[ dispatch, siteId ]
	);
	const trackedRequestBackupSite = useTrackCallback( requestBackupSite, trackEventName );

	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const refreshBackupProgress = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);

	const onClickHandler = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		trackedRequestBackupSite();
		recordLogRocketEvent( trackEventName );
		setDisabled( true );
		setEnqueued( true );

		if ( onClick ) {
			onClick( event );
		}
	};

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
			setButtonContent( statusLabels.QUEUED );
			setCurrentTooltip( statusTooltipTexts.QUEUED );
		} else {
			setButtonContent( children );
			setCurrentTooltip( tooltipText );
			setDisabled( false );
		}
	}, [ areBackupsStopped, backupCurrentlyInProgress, tooltipText, translate, enqueued, children ] );

	const button = (
		<div>
			{ /* Wrapped in a div to avoid disabled button blocking hover events from reaching Tooltip */ }
			<Button
				primary={ variant === 'primary' }
				plain={ variant === 'tertiary' }
				onClick={ onClickHandler }
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
