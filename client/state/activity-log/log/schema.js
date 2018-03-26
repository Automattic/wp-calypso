/** @format */

/**
 * Internal dependencies
 */
import { withItemsSchema } from 'lib/query-manager/schema';

const activityItemsSchema = {
	additionalProperties: false,
	type: 'object',
	patternProperties: {
		'^.+$': {
			type: 'object',
			required: [
				'activityDate',
				'activityGroup',
				'activityIcon',
				'activityId',
				'activityIsRewindable',
				'activityName',
				'activityTs',
				'actorAvatarUrl',
				'actorName',
				'actorRole',
				'actorType',
			],
			properties: {
				activityDate: { type: 'string' },
				activityGroup: { type: 'string' },
				activityIcon: { type: 'string' },
				activityId: { type: 'string' },
				activityIsDiscarded: { type: 'boolean' },
				activityIsRewindable: { type: 'boolean' },
				activityName: { type: 'string' },
				activityStatus: {
					oneOf: [ { type: 'string' }, { type: 'null' } ],
				},
				activityTargetTs: { type: 'number' },
				activityTitle: { type: 'string' },
				activityTs: { type: 'integer' },
				actorAvatarUrl: { type: 'string' },
				actorName: { type: 'string' },
				actorRemoteId: { type: 'integer' },
				actorRole: { type: 'string' },
				actorType: { type: 'string' },
				actorWpcomId: { type: 'integer' },
				rewindId: { type: [ 'null', 'string' ] },
			},
		},
	},
};

export const logItemsSchema = withItemsSchema( activityItemsSchema );
