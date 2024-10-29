import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import * as React from 'react';
import CredentialsPrompt from 'calypso/components/activity-card/toolbar/actions/credentials-prompt';
import DownloadButton from 'calypso/components/activity-card/toolbar/actions/download-button';
import RestoreButton from 'calypso/components/activity-card/toolbar/actions/restore-button';
import ViewFilesButton from 'calypso/components/activity-card/toolbar/actions/view-files-button';
import Button from 'calypso/components/forms/form-button';
import PopoverMenu from 'calypso/components/popover-menu';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import { SUCCESSFUL_BACKUP_ACTIVITIES } from 'calypso/lib/jetpack/backup-utils';
import { backupDownloadPath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getSiteSlug, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { Activity } from '../types';

type SingleSiteOwnProps = {
	siteId: number;
	siteSlug: string;
	rewindId: string;
	isSuccessfulBackup: boolean;
	useSplitButton?: boolean;
};

const SingleSiteActionsButton: React.FC< SingleSiteOwnProps > = ( {
	siteId,
	siteSlug,
	rewindId,
	isSuccessfulBackup,
	useSplitButton = false,
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

	const needsCredentials = useSelector( ( state ) =>
		getDoesRewindNeedCredentials( state, siteId )
	);

	if ( useSplitButton ) {
		const secondaryActions = [
			needsCredentials && <CredentialsPrompt key="credentials-prompt" siteSlug={ siteSlug } />,
			isSuccessfulBackup && (
				<ViewFilesButton key="view-files-button" siteSlug={ siteSlug } rewindId={ rewindId } />
			),
			<DownloadButton
				key="download-button"
				siteId={ siteId }
				siteSlug={ siteSlug }
				rewindId={ rewindId }
			/>,
		];

		return (
			<RestoreButton
				siteId={ siteId }
				siteSlug={ siteSlug }
				rewindId={ rewindId }
				secondaryActions={ secondaryActions }
			/>
		);
	}

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
				<RestoreButton siteId={ siteId } siteSlug={ siteSlug } rewindId={ rewindId } />
				{ needsCredentials && <CredentialsPrompt siteSlug={ siteSlug } /> }
				{ isSuccessfulBackup && <ViewFilesButton siteSlug={ siteSlug } rewindId={ rewindId } /> }
				<DownloadButton siteId={ siteId } siteSlug={ siteSlug } rewindId={ rewindId } />
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
	useSplitButton?: boolean;
};

const ActionsButton: React.FC< OwnProps > = ( {
	siteId,
	activity,
	availableActions,
	onClickClone,
	useSplitButton = false,
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
			useSplitButton={ useSplitButton }
		/>
	);
};

export default ActionsButton;
