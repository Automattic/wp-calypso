import type { ReplyAllow } from './state';
import type { CreatePostInteractionSettings } from '@automattic/api-core';

function buildReply( replyAllow: ReplyAllow ) {
	if ( replyAllow.kind === 'anyone' ) {
		return null;
	}
	if ( replyAllow.kind === 'nobody' ) {
		return { kind: 'nobody' } as const;
	}
	// A combo with no truthy flags is semantically "anyone" — emit nothing on
	// the wire instead of a `{ kind: 'combo' }` payload the backend would read
	// as "no rule applied".
	if ( ! replyAllow.follower && ! replyAllow.following && ! replyAllow.mention ) {
		return null;
	}
	return {
		kind: 'combo' as const,
		...( replyAllow.follower ? { follower: true } : {} ),
		...( replyAllow.following ? { following: true } : {} ),
		...( replyAllow.mention ? { mention: true } : {} ),
	};
}

export function serializeInteractionSettings(
	replyAllow: ReplyAllow,
	allowQuotes: boolean
): CreatePostInteractionSettings | null {
	const reply = buildReply( replyAllow );

	if ( ! reply && allowQuotes ) {
		return null;
	}
	return {
		...( reply ? { reply_allow: reply } : {} ),
		...( allowQuotes ? {} : { allow_quotes: false as const } ),
	};
}

export function summarizeForTracks(
	replyAllow: ReplyAllow,
	allowQuotes: boolean
): Record< string, unknown > {
	const out: Record< string, unknown > = {};
	if ( replyAllow.kind !== 'anyone' ) {
		out.reply_allow_kind = replyAllow.kind;
	}
	if ( replyAllow.kind === 'combo' ) {
		out.combo_follower = replyAllow.follower;
		out.combo_following = replyAllow.following;
		out.combo_mention = replyAllow.mention;
	}
	if ( ! allowQuotes ) {
		out.allow_quotes = false;
	}
	return out;
}
