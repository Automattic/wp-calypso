import type { ComponentResult } from '@automattic/agent-components';

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
