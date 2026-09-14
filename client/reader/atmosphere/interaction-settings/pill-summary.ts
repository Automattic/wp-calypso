import { Icon, blockDefault, globe, people } from '@wordpress/icons';
import { createElement, type ReactNode } from 'react';
import type { ReplyAllow } from './state';

interface PillSummary {
	icon: ReactNode;
	labelKey: 'anyone' | 'nobody' | 'follower' | 'following' | 'mention' | 'some';
}

/**
 * Maps the current `replyAllow` state to the pill's icon + label-key used by
 * the composer footer's `<ComposerExtrasPill>`. Icon picks: globe = anyone,
 * blockDefault = nobody, people = any combo subset.
 */
export function pillSummary( replyAllow: ReplyAllow ): PillSummary {
	if ( replyAllow.kind === 'nobody' ) {
		return {
			icon: createElement( Icon, { icon: blockDefault, size: 16 } ),
			labelKey: 'nobody',
		};
	}
	if ( replyAllow.kind === 'combo' ) {
		const count =
			Number( replyAllow.follower ) + Number( replyAllow.following ) + Number( replyAllow.mention );
		if ( count === 1 ) {
			let single: 'follower' | 'following' | 'mention' = 'mention';
			if ( replyAllow.follower ) {
				single = 'follower';
			} else if ( replyAllow.following ) {
				single = 'following';
			}
			return {
				icon: createElement( Icon, { icon: people, size: 16 } ),
				labelKey: single,
			};
		}
		return {
			icon: createElement( Icon, { icon: people, size: 16 } ),
			labelKey: 'some',
		};
	}
	return {
		icon: createElement( Icon, { icon: globe, size: 16 } ),
		labelKey: 'anyone',
	};
}
