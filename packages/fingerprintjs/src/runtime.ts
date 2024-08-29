import { load } from './agent';

const promise = load().then( ( agent ) => agent.get().then( ( result ) => result.visitorId ) );

export async function getVisitorId(): Promise< string > {
	return promise;
}
