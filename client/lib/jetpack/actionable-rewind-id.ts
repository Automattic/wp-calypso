/**
 * External dependencies
 */
import { useMemo } from 'react';

type Activity = {
	activityIsRewindable: boolean;
	rewindId?: string;
	streams?: Activity[];
};

type Hook = ( activity: Activity ) => string | null | undefined;

// NOTE: Use the hook version if at all possible! This method exists mainly to
//       allow for finding an actionable rewind ID in places that don't
//       support hooks; e.g., class components.
//
// If the activity isn't rewindable but has streams that are,
// use one of the streams' rewind ID as the download or restore point
export const getActionableRewindId: Hook = ( activity ) =>
	activity.activityIsRewindable
		? activity.rewindId
		: activity.streams?.find?.( ( a ) => a.activityIsRewindable )?.rewindId;

export const useActionableRewindId: Hook = ( activity ) =>
	useMemo( () => getActionableRewindId( activity ), [ activity ] );
