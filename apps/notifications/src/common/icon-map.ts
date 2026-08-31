export type NoticonName =
	| 'mention'
	| 'comment'
	| 'add'
	| 'info'
	| 'lock'
	| 'stats'
	| 'reblog'
	| 'star'
	| 'trophy'
	| 'reply'
	| 'warning'
	| 'checkmark'
	| 'cart';

const NOTICON_NAMES: Record< string, NoticonName > = {
	'': 'mention',
	'': 'comment',
	'': 'add',
	'': 'info',
	'': 'lock',
	'': 'stats',
	'': 'reblog',
	'': 'star',
	'': 'trophy',
	'': 'reply',
	'': 'warning',
	'': 'checkmark',
	'': 'cart',
};

/**
 * The semantic name of a note's `noticon` glyph. Each shell maps the name to
 * its own icon component — visuals (e.g. the reply arrow vs a comment icon)
 * are deliberately per-shell.
 */
export function getNoticonName( glyph: string ): NoticonName {
	return NOTICON_NAMES[ glyph ] ?? 'info';
}
