import parseActivityLogEntryContent from '../../components/logs-activity-formatted-block/api-core-parser';
import type { ActivityMediaDetails, Activity } from '../../components/logs-activity/types';
import type { ActivityLogEntry } from '@automattic/api-core';

const parseTimestamp = ( published?: string ): number => {
	if ( ! published ) {
		return 0;
	}

	const timestamp = Date.parse( published );
	return Number.isNaN( timestamp ) ? 0 : timestamp;
};

const normalizeActivityMedia = (
	image?: ActivityLogEntry[ 'image' ] | null
): ActivityMediaDetails => {
	if ( ! image ) {
		return {
			available: false,
			medium_url: '',
			name: '',
			thumbnail_url: '',
			type: '',
			url: '',
		};
	}

	const thumbnailUrl = 'thumbnail_url' in image && image.thumbnail_url ? image.thumbnail_url : '';
	const type = 'type' in image && image.type ? image.type : '';

	return {
		available: Boolean( image.available ),
		medium_url: image.medium_url ?? '',
		name: image.name ?? '',
		thumbnail_url: thumbnailUrl,
		type,
		url: image.url ?? '',
	};
};

/**
 * Transforms an ActivityLogEntry from the API into an Activity for the ActivityEvent component.
 * @param entry The ActivityLogEntry to transform.
 * @returns The transformed Activity.
 */
export const transformActivityLogEntry = ( entry: ActivityLogEntry ): Activity => {
	const {
		content,
		actor,
		image,
		gridicon,
		activity_id: rawActivityId,
		name,
		status,
		summary,
		published,
		is_rewindable,
		rewind_id,
	} = entry;
	const descriptionItems = parseActivityLogEntryContent( content );
	const textDescription = content?.text ?? '';

	return {
		activityDescription: {
			textDescription,
			items: descriptionItems,
		},
		activityIcon: gridicon,
		activityId: rawActivityId,
		activityMedia: normalizeActivityMedia( image ),
		activityName: name,
		activityStatus: status ?? '',
		activityTitle: summary,
		activityUnparsedTs: published,
		activityTs: parseTimestamp( published ),
		activityActor: {
			actorAvatarUrl: actor?.icon?.url,
			actorName: actor?.name,
			actorRole: actor?.role,
			actorType: actor?.type,
			isCli: actor?.is_cli,
			isSupport: actor?.is_happiness,
		},
		activityIsRewindable: Boolean( is_rewindable ),
		rewindId: rewind_id || undefined,
	};
};
