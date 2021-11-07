import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import Button from 'calypso/components/forms/form-button';
import missingCredentialsIcon from 'calypso/components/jetpack/daily-backup-status/missing-credentials.svg';
import PopoverMenu from 'calypso/components/popover-menu';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getSiteSlug, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { Activity } from '../types';
import downloadIcon from './download-icon.svg';

type SingleSiteOwnProps = {
	siteId: number;
	siteSlug: string;
	rewindId: string;
};

const SingleSiteActionsButton: React.FC< SingleSiteOwnProps > = ( {
	siteId,
	siteSlug,
	rewindId,
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
					href={ ! doesRewindNeedCredentials && backupRestorePath( siteSlug, rewindId ) }
					className="toolbar__restore-button"
					disabled={ doesRewindNeedCredentials }
				>
					{ translate( 'Restore to this point' ) }
				</Button>
				{ doesRewindNeedCredentials && (
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
				<Button
					borderless
					compact
					isPrimary={ false }
					href={ backupDownloadPath( siteSlug, rewindId ) }
					className="toolbar__download-button"
				>
					<img
						src={ downloadIcon }
						className="toolbar__download-button-icon"
						role="presentation"
						alt=""
					/>
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
			isPrimary={ true }
			href={ backupDownloadPath( siteSlug, rewindId ) }
			className="toolbar__download-button--multisite"
		>
			{ translate( 'Download backup' ) }
		</Button>
	);
};

type OwnProps = {
	siteId: number;
	activity: Activity;
};

const ActionsButton: React.FC< OwnProps > = ( { siteId, activity } ) => {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	// The activity itself may not be rewindable, but at least one of the
	// streams should be; if this is the case, make sure we send the user
	// to a valid restore/download point when they click an action button
	const actionableRewindId = getActionableRewindId( activity );

	const isMultisite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	if ( isMultisite ) {
		return <MultisiteActionsButton siteSlug={ siteSlug } rewindId={ actionableRewindId } />;
	}

	return (
		<SingleSiteActionsButton
			siteId={ siteId }
			siteSlug={ siteSlug }
			rewindId={ actionableRewindId }
		/>
	);
};

export default ActionsButton;
