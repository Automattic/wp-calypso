import { Button, Tooltip } from '@wordpress/components';
import { FunctionComponent, useCallback, useState } from 'react';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useDispatch } from 'calypso/state';
import { rewindBackupSite } from 'calypso/state/activity-log/actions';

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
	const dispatch = useDispatch();
	const [ disabled, setDisabled ] = useState( false );
	const requestBackupSite = useCallback(
		() => dispatch( rewindBackupSite( siteId ) ),
		[ dispatch, siteId ]
	);
	const trackedRequestBackupSite = useTrackCallback( requestBackupSite, trackEventName );
	const enqueueBackup = () => {
		trackedRequestBackupSite();
		setDisabled( true );
	};

	const button = (
		<Button variant={ variant } onClick={ enqueueBackup } disabled={ disabled }>
			{ children }
		</Button>
	);

	return <>{ tooltipText ? <Tooltip text={ tooltipText }>{ button }</Tooltip> : button }</>;
};

export default BackupNowButton;
