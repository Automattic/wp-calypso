import { VisuallyHidden } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode, useId } from 'react';
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
	/** Holds Restore back and says why, e.g. until known threats are acknowledged nearby. */
	restoreDisabledHint?: string;
};

const RestoreButton: FunctionComponent< RestoreButtonProps > = ( {
	siteId,
	siteSlug,
	rewindId,
	secondaryActions = [],
	restoreDisabledHint,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hintId = useId();
	const cannotRestore = useSelector( ( state ) => ! canRestoreSite( state, siteId ) );
	const isRestoreDisabled = cannotRestore || !! restoreDisabledHint;
	// What holds Restore back is shown nearby; screen readers get it from the description.
	const hint = restoreDisabledHint ? (
		<VisuallyHidden id={ hintId }>{ restoreDisabledHint }</VisuallyHidden>
	) : null;
	const onRestoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_restore_click' ) );
	};

	const buttonLabel = translate( 'Restore to this point' );

	// Conditionally render as a SplitButton if there are secondary actions
	if ( secondaryActions.length > 0 ) {
		return (
			<>
				<SplitButton
					className="toolbar__restore-button"
					disableMain={ isRestoreDisabled }
					mainDescribedBy={ restoreDisabledHint ? hintId : undefined }
					href={ ! isRestoreDisabled && backupRestorePath( siteSlug, rewindId ) }
					label={ buttonLabel }
					onClick={ onRestoreClick }
					allowEventBubbling
					primary
					whiteSeparator
				>
					{ secondaryActions }
				</SplitButton>
				{ hint }
			</>
		);
	}

	return (
		<>
			<Button
				href={ ! isRestoreDisabled && backupRestorePath( siteSlug, rewindId ) }
				className="toolbar__restore-button"
				disabled={ isRestoreDisabled }
				aria-describedby={ restoreDisabledHint ? hintId : undefined }
				onClick={ onRestoreClick }
			>
				{ buttonLabel }
			</Button>
			{ hint }
		</>
	);
};

export default RestoreButton;
