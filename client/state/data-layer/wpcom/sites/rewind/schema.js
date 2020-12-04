/**
 * Rewind state schemas in this file are wrapped in an odd way with the
 * `stateSchema()` helper so that the validation errors are more useful
 *
 * For example, the expected way we might write this is to use `oneOf`
 * and list the various available state schemas. However, a failure
 * deep down in the list of schemas is cascading up through is-my-json-valid
 * and showing as "no (or more than one) schemas match" and there's
 * no further information about the failure.
 *
 * By providing the `allOf: [ { not, schema }, … ]` pattern instead
 * we can get validation failure message that show which state it was
 * trying to validate when it failed.
 */

export const credential = {
	type: 'object',
	properties: {
		still_valid: { type: 'boolean' },
		type: { type: 'string', enum: [ 'auto', 'ftp', 'managed', 'ssh' ] },
		host: { type: 'string' },
		path: { type: 'string' },
		port: { type: 'integer' },
		role: { type: 'string' },
	},
	required: [ 'role', 'still_valid', 'type' ],
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

export const rewind = {
	type: 'object',
	properties: {
		links: { type: 'object' },
		restore_id: { type: 'integer' },
		rewind_id: { type: 'string' },
		status: { type: 'string', enum: [ 'failed', 'finished', 'queued', 'running' ] },
		started_at: { type: 'string' },
		progress: { type: 'integer' },
		reason: { type: 'string' },
		/**
		 * Commenting these out temporarily because API is returning a null value for current_entry,
		 * triggering a schema validation error. Once this is corrected on the backend (soon), we
		 * will activate these properties again.
		 **/
		// message: { type: 'string' },
		// current_entry: { type: 'string' },
	},
	required: [ 'restore_id', 'rewind_id', 'status' ],
};

export const threat = {
	type: 'object',
	properties: {
		id: { type: 'integer' },
		signature: { type: 'string' },
		description: { type: 'string' },
		first_detected: { type: 'string' },
		fixable: { oneOf: [ { type: 'boolean' }, { type: 'object' } ] },
		status: { type: 'string', enum: [ 'current', 'fixed', 'in_progress' ] },
		filename: { type: 'string' },
		context: { type: 'object' },
		extension: { type: 'object' },
	},
};

export const unavailable = stateSchema( 'unavailable', {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^unavailable$',
		},
		reason: {
			type: 'string',
		},
		last_updated: { oneOf: [ { type: 'integer' }, { type: 'string', format: 'date-time' } ] },
		has_cloud: {
			type: 'boolean',
		},
	},
	required: [ 'state', 'last_updated' ],
} );

export const inactive = stateSchema( 'inactive', {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^inactive$',
		},
		credentials: {
			type: 'array',
			items: credential,
		},
		last_updated: { oneOf: [ { type: 'integer' }, { type: 'string', format: 'date-time' } ] },
		has_cloud: {
			type: 'boolean',
		},
	},
	required: [ 'state', 'last_updated' ],
} );

export const awaitingCredentials = stateSchema( 'awaiting_credentials', {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^awaiting_credentials$',
		},
		last_updated: { oneOf: [ { type: 'integer' }, { type: 'string', format: 'date-time' } ] },
		has_cloud: {
			type: 'boolean',
		},
	},
	required: [ 'state', 'last_updated' ],
} );

export const provisioning = stateSchema( 'provisioning', {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^provisioning$',
		},
		credentials: {
			type: 'array',
			items: credential,
		},
		last_updated: { oneOf: [ { type: 'integer' }, { type: 'string', format: 'date-time' } ] },
		has_cloud: {
			type: 'boolean',
		},
	},
	required: [ 'state', 'last_updated' ],
} );

export const active = stateSchema( 'active', {
	type: 'object',
	properties: {
		state: {
			type: 'string',
			pattern: '^active$',
		},
		credentials: {
			type: 'array',
			items: credential,
		},
		downloads: {
			type: 'array',
			items: download,
		},
		rewind,
		alerts: {
			type: 'object',
			items: {
				threats: { type: threat },
			},
		},
		last_updated: { oneOf: [ { type: 'integer' }, { type: 'string', format: 'date-time' } ] },
		has_cloud: {
			type: 'boolean',
		},
	},
	required: [ 'state', 'last_updated' ],
} );

export const rewindStatus = {
	allOf: [ unavailable, inactive, awaitingCredentials, provisioning, active ],
};

function stateSchema( stateName, schema ) {
	return {
		oneOf: [
			{
				not: {
					type: 'object',
					properties: { state: { type: 'string', pattern: `^${ stateName }$` } },
					required: [ 'state' ],
				},
			},
			schema,
		],
	};
}
