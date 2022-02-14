import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const DownloadButton = ( { disabled, rewindId, primary } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const href = disabled ? undefined : backupDownloadPath( siteSlug, rewindId );
	const onDownload = () =>
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_download', { rewind_id: rewindId } ) );

	return (
		<Button
			isPrimary={ primary }
			className="daily-backup-status__download-button"
			href={ href }
			disabled={ disabled }
			onClick={ onDownload }
		>
			{ translate( 'Download backup' ) }
		</Button>
	);
};

const RestoreButton = ( { disabled, rewindId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const needsCredentials = useSelector( ( state ) =>
		getDoesRewindNeedCredentials( state, siteId )
	);
	const isRestoreInProgress = useSelector( ( state ) => getIsRestoreInProgress( state, siteId ) );

	const isRestoreDisabled = disabled || needsCredentials || isRestoreInProgress;
	const href = ! isRestoreDisabled ? backupRestorePath( siteSlug, rewindId ) : undefined;
	const onRestore = () =>
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_restore', { rewind_id: rewindId } ) );

	return (
		<Button
			isPrimary
			className="daily-backup-status__restore-button"
			href={ href }
			disabled={ isRestoreDisabled }
			onClick={ onRestore }
		>
			{ translate( 'Restore to this point' ) }
		</Button>
	);
};

const ActionButtons = ( { rewindId, disabled, isMultiSite } ) => (
	<>
		<DownloadButton
			disabled={ disabled || ! rewindId }
			rewindId={ rewindId }
			primary={ isMultiSite }
		/>
		{ ! isMultiSite && <RestoreButton disabled={ disabled || ! rewindId } rewindId={ rewindId } /> }
	</>
);

ActionButtons.propTypes = {
	rewindId: PropTypes.string,
	disabled: PropTypes.bool,
};

export default ActionButtons;
