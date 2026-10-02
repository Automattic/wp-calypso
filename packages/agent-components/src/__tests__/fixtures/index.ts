import type { ComponentActionResponse, ComponentResult } from '../../types';

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

export function completed(): ComponentResult {
	const result = opening();
	result.revision = 2;
	result.status = 'completed';
	result.summary = 'Example Plugin is active on Example Site.';
	result.surface.components = {
		root: { id: 'root', type: 'Column', children: [ 'proposal' ] },
		proposal: { id: 'proposal', type: 'Text', variant: 'body', content: { text: result.summary } },
	};
	return result;
}

export function applied( requestId = 'request-123' ) {
	return {
		protocol: 'agent-component/0.1',
		requestId,
		outcome: 'applied',
		current: {
			protocol: 'agent-component/0.1',
			resolvedLocale: 'en-US',
			request: { state: 'settled', requestId, outcome: 'applied', revision: 2 },
			state: 'completed',
			instanceId: 'instance-123',
			allowedActions: [],
			revision: 2,
			result: completed(),
			expiresAt: new Date( Date.now() + 30 * 60 * 1000 ).toISOString(),
		},
	} satisfies ComponentActionResponse;
}

export function negative( outcome: 'rejected' | 'stale' | 'indeterminate' ) {
	return {
		protocol: 'agent-component/0.1',
		requestId: 'request-123',
		outcome,
		current: {
			protocol: 'agent-component/0.1',
			resolvedLocale: 'en-US',
			request: { state: 'unknown', requestId: 'request-123' },
			state: outcome === 'indeterminate' ? 'temporarily-unavailable' : 'not-found',
			reason: outcome === 'indeterminate' ? 'STATE_UNAVAILABLE' : 'INSTANCE_UNAVAILABLE',
			instanceId: 'instance-123',
			allowedActions: [],
			summary:
				outcome === 'indeterminate'
					? 'The action outcome could not be verified. Do not repeat it; check the site manually.'
					: 'This confirmation is unavailable. Request a new proposal.',
		},
	};
}
