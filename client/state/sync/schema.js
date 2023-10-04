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

export const siteSyncSite = {
	type: 'object',
	properties: {
		status,
		fetchingStatus,
		progress,
		isSyncingInProgress,
	},
};

export const siteSync = {
	type: 'object',
	patternProperties: {
		'^\\d+$': siteSyncSite,
	},
};
