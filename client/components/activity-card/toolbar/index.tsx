import * as React from 'react';
import { isSuccessfulRealtimeBackup } from 'calypso/lib/jetpack/backup-utils';
import { Activity } from '../types';
import ActionsButton from './actions-button';
import ExpandContent from './expand-content';

import './style.scss';

type OwnProps = {
	siteId: number;
	activity: Activity;
	isContentExpanded?: boolean;
	onToggleContent?: () => void;
};

const Toolbar: React.FC< OwnProps > = ( {
	siteId,
	activity,
	isContentExpanded,
	onToggleContent,
} ) => {
	const isRewindable = isSuccessfulRealtimeBackup( activity );
	const { streams } = activity;

	if ( ! isRewindable && ! streams ) {
		return null;
	}

	return (
		<div
			// force the actions to stay in the left if we aren't showing the content link
			className={ streams ? 'activity-card__toolbar' : 'activity-card__toolbar--reverse' }
		>
			{ streams && <ExpandContent isExpanded={ isContentExpanded } onToggle={ onToggleContent } /> }
			{ isRewindable && <ActionsButton siteId={ siteId } activity={ activity } /> }
		</div>
	);
};

export default Toolbar;
