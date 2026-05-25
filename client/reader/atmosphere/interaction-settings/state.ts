export type ReplyAllow =
	| { kind: 'anyone' }
	| { kind: 'nobody' }
	| {
			kind: 'combo';
			follower: boolean;
			following: boolean;
			mention: boolean;
	  };

export type ComboFlag = 'follower' | 'following' | 'mention';

export const DEFAULT_REPLY_ALLOW: ReplyAllow = { kind: 'anyone' };
export const DEFAULT_ALLOW_QUOTES = true;

const EMPTY_COMBO = {
	kind: 'combo' as const,
	follower: false,
	following: false,
	mention: false,
};

export function applyReplyAllowRadio( choice: 'anyone' | 'nobody' ): ReplyAllow {
	return choice === 'anyone' ? { kind: 'anyone' } : { kind: 'nobody' };
}

export function toggleComboFlag(
	current: ReplyAllow,
	flag: ComboFlag,
	checked: boolean
): ReplyAllow {
	if ( current.kind === 'nobody' ) {
		// Combo checkboxes are visually disabled in the nobody state. Defensive
		// guard so a stray click-during-disabled-render can't corrupt state.
		return current;
	}
	const base = current.kind === 'combo' ? current : EMPTY_COMBO;
	const next = { ...base, [ flag ]: checked };
	const anyOn = next.follower || next.following || next.mention;
	if ( ! anyOn ) {
		return { kind: 'anyone' };
	}
	return next;
}
