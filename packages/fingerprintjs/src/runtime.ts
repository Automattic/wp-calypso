import { load } from './agent';

export async function getVisitorId() {
	const agent = await load();
	const result = await agent.get();
	return result.visitorId;
}
