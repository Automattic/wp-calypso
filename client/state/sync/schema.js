export const status = {
	type: [ 'string', 'null' ],
};

export const fetchingStatus = {
	type: 'boolean',
};

export const progress = {
	type: 'number',
};

export const isSyncingInProgress = {
	type: 'boolean',
};

export const syncingTargetSite = {
	type: [ 'string', 'null' ],
};

export const syncingSourceSite = {
	type: [ 'string', 'null' ],
};

export const restoreId = {
	type: [ 'string', 'null' ],
};

export const error = {
	type: [ 'string', 'null' ],
};

export const siteSyncSite = {
	type: 'object',
	properties: {
		status,
		fetchingStatus,
		progress,
		isSyncingInProgress,
		syncingSourceSite,
		syncingTargetSite,
		restoreId,
		error,
	},
};

export const siteSync = {
	type: 'object',
	patternProperties: {
		'^\\d+$': siteSyncSite,
	},
};
