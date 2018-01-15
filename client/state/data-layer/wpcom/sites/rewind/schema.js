/** @format */

export const credential = {
	type: 'object',
	properties: {
		still_valid: { type: 'boolean' },
		type: { type: 'string', enum: [ 'auto', 'ftp', 'sftp', 'ssh' ] },
		host: { type: 'string' },
		port: { type: 'integer' },
	},
	required: [ 'still_valid', 'type' ],
};

export const download = {
	type: 'object',
	properties: {
		downloadId: { type: 'integer' },
		rewindId: { type: 'string' },
		backupPoint: { type: 'integer' },
		startedAt: { type: 'integer' },
		downloadCount: { type: 'integer' },
		validUntil: { type: 'integer' },
	},
	required: [ 'downloadId', 'rewindId', 'backupPoint', 'startedAt' ],
};

export const restore = {
	type: 'object',
	properties: {
		status: { type: 'string', enum: [ 'finished', 'inactive', 'queued', 'running' ] },
		percent: { type: 'integer' },
	},
	required: [ 'status' ],
};

export const unavailable = {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^unavailable$',
		},
		reason: {
			type: 'string',
		},
		last_updated: { type: 'integer' },
	},
	required: [ 'state', 'last_updated' ],
};

export const inactive = {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^inactive$',
		},
		credentials: {
			type: [ 'array', 'null' ],
			items: credential,
		},
		last_updated: { type: 'integer' },
	},
	required: [ 'state', 'last_updated' ],
};

export const awaitingCredentials = {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^awaiting_credentials$',
		},
		last_updated: { type: 'integer' },
	},
	required: [ 'state', 'last_updated' ],
};

export const provisioning = {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^provisioning$',
		},
		credentials: {
			type: [ 'array', 'null' ],
			items: credential,
		},
		last_updated: { type: 'integer' },
	},
	required: [ 'state', 'last_updated' ],
};

export const active = {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^active$',
		},
		credentials: {
			type: [ 'array', 'null' ],
			items: credential,
		},
		downloads: {
			type: [ 'array', 'null' ],
			items: download,
		},
		rewinds: { type: 'array', items: restore },
		last_updated: { type: 'integer' },
	},
	required: [ 'state', 'last_updated' ],
};

export const rewind = {
	oneOf: [ unavailable, inactive, awaitingCredentials, provisioning, active ],
};
