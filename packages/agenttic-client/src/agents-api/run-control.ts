import type { AgentsApiRunAdapter } from './types';
import { normalizeRunEvent } from './normalizer';

export function createAgentsApiRunControlAdapter(
	adapter: AgentsApiRunAdapter
): AgentsApiRunAdapter {
	return adapter;
}

export { normalizeRunEvent };
