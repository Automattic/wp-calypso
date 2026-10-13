import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { getSiteSetupTasksCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `get-site-setup-tasks` ability definition: a read-only view of the
 * site's Site Setup (AI Launchpad) task list.
 *
 * The `agents-manager/get-site-setup-tasks` name is the key the backend route
 * allowlists match on — renaming it silently drops the ability from every
 * surface.
 */
export const getSiteSetupTasksAbility: Ability = {
	name: 'agents-manager/get-site-setup-tasks',
	label: __( 'Get site setup tasks', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		"Read the site's Site Setup task list: the tasks a new site owner is guided through before launch, each with its status (todo, in-progress, done, skipped) and the link that starts it. Use it when the user asks what is left to do, what to do next, how far along the setup is, or whether the site is ready to launch. Read-only: it never completes or skips a task. Some sites have no setup list; the result says so.",
	input_schema: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the task list could be read.',
					},
					message: {
						type: 'string',
						description: 'Human-readable summary of the setup progress.',
					},
					error: {
						type: 'string',
						description: 'Error details when success is false.',
					},
					details: {
						type: 'object',
						properties: {
							eligible: {
								type: 'boolean',
								description: 'Whether the site has a Site Setup task list.',
							},
							tasks: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										id: { type: 'string' },
										title: { type: 'string' },
										subtitle: { type: 'string' },
										status: {
											type: 'string',
											enum: [ 'todo', 'in-progress', 'done', 'skipped' ],
										},
										disabled: {
											type: 'boolean',
											description: 'The task cannot be started on this site yet.',
										},
										url: {
											type: 'string',
											description:
												'Absolute URL where the task is done, when it has a destination.',
										},
									},
									required: [ 'id', 'title', 'status' ],
								},
							},
							progress: {
								type: 'object',
								properties: {
									completed: { type: 'number' },
									total: { type: 'number' },
								},
								required: [ 'completed', 'total' ],
							},
						},
						required: [ 'eligible', 'tasks', 'progress' ],
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: {
				type: 'boolean',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: getSiteSetupTasksCallback,
	meta: {
		annotations: {
			readonly: true,
			idempotent: true,
		},
	},
};
