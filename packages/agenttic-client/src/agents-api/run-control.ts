import { normalizeRunEvent } from './normalizer';
import type { AgentsApiRunAdapter } from './types';

export function createAgentsApiRunControlAdapter(
	adapter: AgentsApiRunAdapter
): AgentsApiRunAdapter {
	return adapter;
}

export { normalizeRunEvent };
