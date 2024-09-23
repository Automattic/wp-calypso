import { Gridicon } from '@automattic/components';
import { Icon, download as downloadIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import * as React from 'react';
import ExternalLink from 'calypso/components/external-link';
import Button from 'calypso/components/forms/form-button';
import missingCredentialsIcon from 'calypso/components/jetpack/daily-backup-status/missing-credentials.svg';
import PopoverMenu from 'calypso/components/popover-menu';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import { SUCCESSFUL_BACKUP_ACTIVITIES } from 'calypso/lib/jetpack/backup-utils';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRequestBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { Activity } from '../types';
import ViewFilesButton from './buttons/view-files-button';

type SingleSiteOwnProps = {
	siteId: number;
	siteSlug: string;
	rewindId: string;
	isSuccessfulBackup: boolean;
};

const SingleSiteActionsButton: React.FC< SingleSiteOwnProps > = ( {
	siteId,
	siteSlug,
	rewindId,
	isSuccessfulBackup,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const buttonRef = useRef( null );
	const [ isPopoverVisible, setPopoverVisible ] = useState( false );
	const togglePopoverMenu = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_click' ) );
		setPopoverVisible( ! isPopoverVisible );
	};
	const closePopoverMenu = () => {
		setPopoverVisible( false );
	};

	const doesRewindNeedCredentials = useSelector( ( state ) =>
		getDoesRewindNeedCredentials( state, siteId )
	);

	const areCredentialsInvalid = useSelector( ( state ) =>
		areJetpackCredentialsInvalid( state, siteId, 'main' )
	);

	const isRestoreInProgress = useSelector( ( state ) => getIsRestoreInProgress( state, siteId ) );

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const isRestoreDisabled =
		doesRewindNeedCredentials || isRestoreInProgress || ( ! isAtomic && areCredentialsInvalid );

	const onRestoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_restore_click' ) );
	};

	const onDownloadClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_actions_download_click', {
				rewind_id: rewindId,
			} )
		);
		dispatch( rewindRequestBackup( siteId, rewindId ) );
	};

	return (
		<>
			<Button
				compact
				borderless
				className="toolbar__button"
				onClick={ togglePopoverMenu }
				ref={ buttonRef }
			>
				{ translate( 'Actions' ) }
				<Gridicon icon="add" className="toolbar__button-icon" />
			</Button>
			<PopoverMenu
				context={ buttonRef.current }
				isVisible={ isPopoverVisible }
				onClose={ closePopoverMenu }
				className="toolbar__actions-popover"
			>
				<Button
					href={ ! isRestoreDisabled && backupRestorePath( siteSlug, rewindId ) }
					className="toolbar__restore-button"
					disabled={ isRestoreDisabled }
					onClick={ onRestoreClick }
				>
					{ translate( 'Restore to this point' ) }
				</Button>
				{ ! isAtomic && ( doesRewindNeedCredentials || areCredentialsInvalid ) && (
					<div className="toolbar__credentials-warning">
						<img src={ missingCredentialsIcon } alt="" role="presentation" />
						<div className="toolbar__credentials-warning-text">
							{ translate(
								'{{a}}Enter your server credentials{{/a}} to enable one-click restores from your backups.',
								{
									components: {
										a: <ExternalLink href={ settingsPath( siteSlug ) } />,
									},
								}
							) }
						</div>
					</div>
				) }
				{ isSuccessfulBackup && <ViewFilesButton siteSlug={ siteSlug } rewindId={ rewindId } /> }
				<Button
					borderless
					compact
					isPrimary={ false }
					onClick={ onDownloadClick }
					href={ backupDownloadPath( siteSlug, rewindId ) }
					className="toolbar__download-button"
				>
					<Icon icon={ downloadIcon } className="toolbar__download-button-icon" size={ 18 } />
					{ translate( 'Download backup' ) }
				</Button>
			</PopoverMenu>
		</>
	);
};

type MultisiteOwnProps = {
	siteSlug: string;
	rewindId: string;
};

const MultisiteActionsButton: React.FC< MultisiteOwnProps > = ( { siteSlug, rewindId } ) => {
	const translate = useTranslate();

	return (
		<Button
			compact
			isPrimary
			href={ backupDownloadPath( siteSlug, rewindId ) }
			className="toolbar__download-button--multisite"
		>
			{ translate( 'Download backup' ) }
		</Button>
	);
};

type CloneSiteOwnProps = {
	rewindId: string;
	onClickClone: ( period: string ) => void;
};

const CloneSiteActionButton: React.FC< CloneSiteOwnProps > = ( { rewindId, onClickClone } ) => {
	const translate = useTranslate();

	return (
		<Button
			compact
			className="toolbar__button"
			isPrimary={ false }
			onClick={ () => onClickClone( rewindId ) }
		>
			{ translate( 'Clone from here' ) }
		</Button>
	);
};

type OwnProps = {
	siteId: number;
	activity: Activity;
	availableActions?: Array< string >;
	onClickClone?: ( period: string ) => void;
};

const ActionsButton: React.FC< OwnProps > = ( {
	siteId,
	activity,
	availableActions,
	onClickClone,
} ) => {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	// The activity itself may not be rewindable, but at least one of the
	// streams should be; if this is the case, make sure we send the user
	// to a valid restore/download point when they click an action button
	const actionableRewindId = getActionableRewindId( activity );

	// Let's validate if the activity is a successful backup so we could decide which actions to show.
	const isSuccessfulBackup = SUCCESSFUL_BACKUP_ACTIVITIES.includes( activity?.activityName );

	const isMultisite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	if ( isMultisite ) {
		return (
			<MultisiteActionsButton siteSlug={ siteSlug ?? '' } rewindId={ actionableRewindId ?? '' } />
		);
	}

	// Show the clone action button only if is the only action available.
	if ( availableActions && availableActions.length === 1 && availableActions[ 0 ] === 'clone' ) {
		return (
			// We know onClickClone is never null if the action is clone. Non-null asserting is safe here.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			<CloneSiteActionButton rewindId={ actionableRewindId ?? '' } onClickClone={ onClickClone! } />
		);
	}

	// Show the defaults actions for simple sites.
	return (
		<SingleSiteActionsButton
			siteId={ siteId }
			siteSlug={ siteSlug ?? '' }
			rewindId={ actionableRewindId ?? '' }
			isSuccessfulBackup={ isSuccessfulBackup }
		/>
	);
};

export default ActionsButton;
