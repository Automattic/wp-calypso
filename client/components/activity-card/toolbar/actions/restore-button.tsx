import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';
import Button from 'calypso/components/forms/form-button';
import SplitButton from 'calypso/components/split-button';
import { backupRestorePath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';

type RestoreButtonProps = {
	siteId: number;
	siteSlug: string;
	rewindId: string;
	secondaryActions?: ReactNode[];
};

const RestoreButton: FunctionComponent< RestoreButtonProps > = ( {
	siteId,
	siteSlug,
	rewindId,
	secondaryActions = [],
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isRestoreDisabled = useSelector( ( state ) => ! canRestoreSite( state, siteId ) );
	const onRestoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_restore_click' ) );
	};

	const buttonLabel = translate( 'Restore to this point' );

	// Conditionally render as a SplitButton if there are secondary actions
	if ( secondaryActions.length > 0 ) {
		return (
			<SplitButton
				className="toolbar__restore-button"
				disableMain={ isRestoreDisabled }
				href={ ! isRestoreDisabled && backupRestorePath( siteSlug, rewindId ) }
				label={ buttonLabel }
				onClick={ onRestoreClick }
				primary
				whiteSeparator
			>
				{ secondaryActions }
			</SplitButton>
		);
	}

	return (
		<Button
			href={ ! isRestoreDisabled && backupRestorePath( siteSlug, rewindId ) }
			className="toolbar__restore-button"
			disabled={ isRestoreDisabled }
			onClick={ onRestoreClick }
		>
			{ buttonLabel }
		</Button>
	);
};

export default RestoreButton;
