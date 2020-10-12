/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import Button from 'components/forms/form-button';
import { settingsPath } from 'lib/jetpack/paths';
import { backupDownloadPath, backupRestorePath } from 'my-sites/backup/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import getDoesRewindNeedCredentials from 'state/selectors/get-does-rewind-need-credentials';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';
import missingCredentialsIcon from './missing-credentials.svg';

const DownloadButton = ( { disabled, rewindId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const href = disabled ? undefined : backupDownloadPath( siteSlug, rewindId );
	const onDownload = () =>
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_download', { rewind_id: rewindId } ) );

	return (
		<Button
			isPrimary={ false }
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

	const canRestore = ! disabled && ! needsCredentials;
	const href = canRestore ? backupRestorePath( siteSlug, rewindId ) : undefined;
	const onRestore = () =>
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_restore', { rewind_id: rewindId } ) );

	return (
		<Button
			isPrimary
			className="daily-backup-status__restore-button"
			href={ href }
			disabled={ ! canRestore }
			onClick={ onRestore }
		>
			<div className="daily-backup-status__restore-button-icon">
				{ needsCredentials && ! isEnabled( 'jetpack/backup-simplified-screens' ) && (
					<img src={ missingCredentialsIcon } alt="" role="presentation" />
				) }
				<div>{ translate( 'Restore to this point' ) }</div>
			</div>
		</Button>
	);
};

const MissingCredentials = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const onActivateRestores = () =>
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_activate_click' ) );

	return (
		<div className="daily-backup-status__credentials-warning">
			<div className="daily-backup-status__credentials-warning-top">
				<img src={ missingCredentialsIcon } alt="" role="presentation" />
				<div>{ translate( 'Restore points have not been enabled for your account' ) }</div>
			</div>

			<div className="daily-backup-status__credentials-warning-bottom">
				<div className="daily-backup-status__credentials-warning-text">
					{ translate(
						'A backup of your data has been made, but you must enter your server credentials to enable one-click restores. {{a}}Find your server credentials{{/a}}',
						{
							components: {
								a: (
									<ExternalLink
										icon
										href="https://jetpack.com/support/ssh-sftp-and-ftp-credentials/"
										onClick={ () => {} }
									/>
								),
							},
						}
					) }
				</div>
				<Button
					isPrimary={ false }
					className="daily-backup-status__activate-restores-button"
					href={ settingsPath( siteSlug ) }
					onClick={ onActivateRestores }
				>
					{ translate( 'Activate restores' ) }
				</Button>
			</div>
		</div>
	);
};

const ActionButtons = ( { rewindId, disabled } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const hasCredentials = useSelector(
		( state ) => ! getDoesRewindNeedCredentials( state, siteId )
	);

	return (
		<>
			<DownloadButton disabled={ disabled || ! rewindId } rewindId={ rewindId } />
			<RestoreButton disabled={ disabled || ! rewindId } rewindId={ rewindId } />
			{ ! hasCredentials && ! isEnabled( 'jetpack/backup-simplified-screens' ) && (
				<MissingCredentials />
			) }
		</>
	);
};

ActionButtons.propTypes = {
	rewindId: PropTypes.string,
	disabled: PropTypes.bool,
};

export default ActionButtons;
