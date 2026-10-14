import { generateUUID } from './generate-uuid';

const TURN_ID_KEY = 'agents-manager-turn-id';

let memoryTurnId = '';

/**
 * Starts a new turn: one message the merchant sends and everything the agent
 * does to answer it. Kept in `sessionStorage` so a turn that navigates the page
 * mid-reply keeps its id on the other side.
 *
 * The session id cannot stand in for it: it names the whole conversation, and
 * the server assigns it on the first reply, after the first send was recorded.
 */
export function startTurn(): string {
	memoryTurnId = generateUUID();
	try {
		sessionStorage.setItem( TURN_ID_KEY, memoryTurnId );
	} catch {
		// Storage unavailable: the id still lasts for this page load.
	}
	return memoryTurnId;
}

/** The current turn's id, or '' before the tab's first send. */
export function getTurnId(): string {
	try {
		return sessionStorage.getItem( TURN_ID_KEY ) || memoryTurnId;
	} catch {
		return memoryTurnId;
	}
}
