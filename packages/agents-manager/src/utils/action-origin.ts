/**
 * Who asked for the next chat open, close or send: the merchant in the chat's
 * own UI, a suggestion chip, or a host through the actions bridge. The caller
 * marks the origin right before the action and the event that records the
 * action takes it, so each mark labels exactly one event and everything
 * unmarked keeps the default.
 */
type ChatAction = 'open' | 'close' | 'send';

const DEFAULT_ORIGIN: Record< ChatAction, string > = {
	open: 'user',
	close: 'user',
	send: 'composer',
};

const pending = new Map< ChatAction, string >();

export function markActionOrigin( action: ChatAction, origin: string ): void {
	pending.set( action, origin );
}

export function takeActionOrigin( action: ChatAction ): string {
	const origin = pending.get( action ) ?? DEFAULT_ORIGIN[ action ];
	pending.delete( action );
	return origin;
}
