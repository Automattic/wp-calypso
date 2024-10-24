import clsx from 'clsx';
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
	availableActions?: Array< string >;
	onClickClone?: ( period: string ) => void;
	hideExpandedContent?: boolean;
	useSplitButton?: boolean;
};

const Toolbar: React.FC< OwnProps > = ( {
	siteId,
	activity,
	isContentExpanded,
	onToggleContent,
	availableActions,
	onClickClone,
	hideExpandedContent = false,
	useSplitButton = false,
} ) => {
	const isRewindable = isSuccessfulRealtimeBackup( activity );
	const { streams } = activity;

	if ( ! isRewindable && ! streams ) {
		return null;
	}

	const showStreams = streams && ! hideExpandedContent;

	const classNames = clsx( {
		// force the actions to stay in the left if we aren't showing the content link
		'activity-card__toolbar': showStreams || useSplitButton,
		'activity-card__toolbar--reverse': ! showStreams && ! useSplitButton,
		'activity-card__split-button': useSplitButton,
	} );

	return (
		<div className={ classNames }>
			{ showStreams && (
				<ExpandContent isExpanded={ isContentExpanded } onToggle={ onToggleContent } />
			) }
			{ isRewindable && (
				<ActionsButton
					siteId={ siteId }
					activity={ activity }
					availableActions={ availableActions }
					onClickClone={ onClickClone }
					useSplitButton={ useSplitButton }
				/>
			) }
		</div>
	);
};

export default Toolbar;
