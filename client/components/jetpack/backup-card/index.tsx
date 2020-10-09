/**
 * External dependencies
 */
import classNames from 'classnames';
import { noop } from 'lodash';
import React, { useRef, FunctionComponent, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ActivityActor, { SIZE_S } from 'calypso/components/activity-card/activity-actor';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import ActivityMedia from 'calypso/components/activity-card/activity-media';
import Badge from 'calypso/components/badge';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Tooltip from 'calypso/components/tooltip';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';
import cloudIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-success.svg';

/**
 * Type dependencies
 */
import type { Activity } from 'calypso/state/activity-log/types';

type Props = {
	activity: Activity;
	subActivities?: Activity[];
	isLatest: boolean;
	isFeatured: boolean;
};

const BackupCard: FunctionComponent< Props > = ( {
	activity,
	subActivities,
	isLatest,
	isFeatured,
} ) => {
	const { activityTs, activityTitle, rewindId } = activity;

	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();
	const moment = useLocalizedMoment();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const hasCredentials = useSelector(
		( state ) => ! getDoesRewindNeedCredentials( state, siteId )
	);

	const restoreRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisibility ] = useState( false );
	const onRestoreButtonEnter = useCallback( () => setTooltipVisibility( true ), [
		setTooltipVisibility,
	] );
	const onRestoreButtonLeave = useCallback( () => setTooltipVisibility( false ), [
		setTooltipVisibility,
	] );
	const onDownloadClick = useTrackCallback( noop, 'calypso_jetpack_backup_download', {
		rewind_id: rewindId,
	} );
	const onRestoreClick = useTrackCallback( noop, 'calypso_jetpack_backup_restore', {
		rewind_id: rewindId,
	} );

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">
							<time dateTime={ moment( activityTs ).format() }>
								{ getDisplayDate( activityTs, false ) }
							</time>
						</h2>
						<p className="backup-card__title">
							<img className="backup-card__icon" src={ cloudIcon } alt="" />
							{ activityTitle }
						</p>
					</div>
					{ isLatest && (
						<Badge className="backup-card__badge" type="success">
							{ translate( 'Latest backup' ) }
						</Badge>
					) }
				</div>
				{ rewindId && (
					<ul className="backup-card__actions">
						<li>
							<Button
								className="backup-card__restore-button"
								href={ backupRestorePath( siteSlug, rewindId ) }
								disabled={ ! hasCredentials }
								primary={ hasCredentials }
								onClick={ onRestoreClick }
							>
								{ translate( 'Restore to this point' ) }
							</Button>
							{ ! hasCredentials && (
								<span
									className="backup-card__restore-area"
									onMouseEnter={ onRestoreButtonEnter }
									onMouseLeave={ onRestoreButtonLeave }
									ref={ restoreRef }
								></span>
							) }
							{ restoreRef.current && (
								<Tooltip
									className="backup-card__restore-tooltip"
									context={ restoreRef.current }
									isVisible={ isTooltipVisible }
									showOnMobile
								>
									{ translate( 'Add your server credentials to enable one-click restores.' ) }
								</Tooltip>
							) }
						</li>
						<li>
							<Button
								className="backup-card__download-button"
								href={ backupDownloadPath( siteSlug, rewindId ) }
								primary={ ! hasCredentials }
								onClick={ onDownloadClick }
							>
								{ translate( 'Download backup' ) }
							</Button>
						</li>
					</ul>
				) }
			</div>
			<div className="backup-card__about">
				<h3 className="backup-card__about-heading">{ translate( 'About this backup' ) }</h3>
				<div className="backup-card__about-content">
					<ul className="backup-card__about-list">
						{ ( subActivities && subActivities?.length > 0 ? subActivities : [ activity ] ).map(
							( item ) => (
								<li key={ item.activityId }>
									<div className="backup-card__about-media">
										<ActivityActor
											actorAvatarUrl={ item.actorAvatarUrl }
											actorName={ item.actorName }
											actorRole={ item.actorRole }
											actorType={ item.actorType }
											size={ SIZE_S }
											withoutInfo
										/>
									</div>
									<div className="backup-card__about-body">
										{ item.activityMedia?.available && (
											<ActivityMedia
												name={ item.activityMedia?.name }
												thumbnail={
													item.activityMedia?.medium_url || item.activityMedia?.thumbnail_url
												}
											/>
										) }
										<ActivityDescription activity={ item } />
									</div>
								</li>
							)
						) }
					</ul>
				</div>
			</div>
		</Card>
	);
};

export default BackupCard;
