import { isEnabled } from '@automattic/calypso-config';
import { Card, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import ActivityActor from 'calypso/components/activity-card/activity-actor';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import MediaPreview from './media-preview';
import ShareActivity from './share-activity';
import StreamsContent from './streams-content';
import Toolbar from './toolbar';
import type { Activity } from './types';

import './style.scss';

const useToggleContent = (): [ boolean, () => void ] => {
	const [ isVisible, setVisible ] = useState( false );

	const toggle = () => {
		setVisible( ! isVisible );
	};

	return [ isVisible, toggle ];
};

const useBackupTimeDisplay = ( activityTs: number ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );

	return useMemo( () => applySiteOffset( activityTs, { gmtOffset, timezone } ).format( 'LT' ), [
		activityTs,
		gmtOffset,
		timezone,
	] );
};

type OwnProps = {
	className?: string;
	summarize?: boolean;
	shareable?: boolean;
	activity: Activity;
};

const ActivityCard: React.FC< OwnProps > = ( { className, summarize, shareable, activity } ) => {
	const [ showContent, toggleShowContent ] = useToggleContent();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const backupTimeDisplay = useBackupTimeDisplay( activity.activityTs );

	const showStreamsContent = showContent && activity.streams;
	const hasActivityFailed = activity.activityStatus === 'error';

	return (
		<div
			className={ classnames( className, 'activity-card', {
				'with-error': hasActivityFailed,
			} ) }
		>
			<QueryRewindState siteId={ siteId } />
			{ ! summarize && (
				<div className="activity-card__header">
					<div className="activity-card__time">
						<Gridicon
							icon={ activity.activityIcon as string }
							className="activity-card__time-icon"
						/>
						<div className="activity-card__time-text">{ backupTimeDisplay }</div>
					</div>
					{ isEnabled( 'jetpack/activity-log-sharing' ) && shareable && (
						<ShareActivity siteId={ siteId } activity={ activity } />
					) }
				</div>
			) }
			<Card>
				<ActivityActor
					actorAvatarUrl={ activity.actorAvatarUrl }
					actorName={ activity.actorName }
					actorRole={ activity.actorRole }
					actorType={ activity.actorType }
				/>
				<div className="activity-card__activity-description">
					<MediaPreview activity={ activity } />
					<ActivityDescription activity={ activity } />
				</div>
				<div className="activity-card__activity-title">{ activity.activityTitle }</div>

				{ ! summarize && (
					<Toolbar
						siteId={ siteId }
						activity={ activity }
						isContentExpanded={ showContent }
						onToggleContent={ toggleShowContent }
					/>
				) }

				{ showStreamsContent && (
					<div className="activity-card__content">
						<StreamsContent streams={ activity.streams as Activity[] } />
						<Toolbar
							siteId={ siteId }
							activity={ activity }
							isContentExpanded={ showContent }
							onToggleContent={ toggleShowContent }
						/>
					</div>
				) }
			</Card>
		</div>
	);
};

export default ActivityCard;
