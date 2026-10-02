import type { ComponentOpening, ComponentResult } from '@automattic/agent-components';

export function opening(): ComponentResult {
	return {
		protocol: 'agent-component/0.1',
		component: 'button-action',
		instanceId: 'instance-123',
		revision: 1,
		status: 'awaiting-input',
		summary: 'Activate Example Plugin on Example Site.',
		surface: {
			protocol: 'minimal-ai-ui/0.1',
			rootId: 'root',
			components: {
				root: { id: 'root', type: 'Column', children: [ 'proposal', 'run' ] },
				proposal: {
					id: 'proposal',
					type: 'Text',
					variant: 'body',
					content: { text: 'Activate Example Plugin on Example Site.' },
				},
				run: {
					id: 'run',
					type: 'Button',
					label: 'Activate Example Plugin',
					action: 'tool.execute',
					variant: 'primary',
				},
			},
			data: {},
		},
	};
}

export function formOpening(): ComponentOpening {
	return {
		protocol: 'agent-component/0.1',
		allowedActions: [ 'site.update' ],
		actionBindings: { 'site.update': [ '/site/name' ] },
		expiresAt: '2099-09-30T12:00:00+00:00',
		result: {
			protocol: 'agent-component/0.1',
			component: 'ability-form',
			instanceId: 'instance-123',
			revision: 1,
			status: 'awaiting-input',
			summary: 'Update the name of Example Site.',
			surface: {
				protocol: 'minimal-ai-ui/0.1',
				rootId: 'root',
				components: {
					root: { id: 'root', type: 'Column', children: [ 'name', 'save' ] },
					name: {
						id: 'name',
						type: 'TextField',
						label: 'Site name',
						path: '/site/name',
						inputMode: 'shortText',
					},
					save: {
						id: 'save',
						type: 'Button',
						label: 'Save site name',
						action: 'site.update',
						variant: 'primary',
					},
				},
				data: { site: { name: 'Example Site' } },
			},
		},
	};
}
