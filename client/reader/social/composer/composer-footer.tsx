import { __experimentalHStack as HStack, Button, Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

interface Props {
	graphemeCount: number;
	onSubmit: () => void;
	isPending: boolean;
	limit: number;
	/**
	 * Optional override for the Post button's disabled state. When provided,
	 * fully replaces the footer's internal `isPending || tooLong || empty`
	 * logic so the parent can extend it (e.g. gating on uploaded media).
	 */
	disabled?: boolean;
	/**
	 * Optional left-side content rendered before the character counter — e.g.
	 * a per-protocol media trigger button supplied by `ComposerMediaSlot.
	 * renderFooterTrigger`. Pass `null` (or omit) for protocols without a
	 * media picker.
	 */
	footerStart?: ReactNode;
	/**
	 * Counter unit — drives the screen-reader label only. Atmosphere /
	 * Mastodon count graphemes (`'characters'`); Fediverse counts words.
	 * Defaults to `'graphemes'` so existing call sites keep their labels.
	 */
	counterUnit?: 'graphemes' | 'words';
	/**
	 * When true, the `limit` value is a UX threshold rather than a wire-
	 * level cap. The button stays labelled "Post" past the limit (instead
	 * of switching to the overflow-handoff cue "Better as a blog post"),
	 * and the parent is expected to also leave `disabled` undefined or
	 * false in that state. Defaults to `false` (atmosphere / mastodon:
	 * hard caps where the alternate label is the meaningful cue).
	 */
	softLimit?: boolean;
}

const WARN_THRESHOLD_REMAINING = 50;

// Build the screen-reader label for the count cell. Pulled out of the
// render to keep `<ComposerFooter>` flat (avoids nested ternaries).
function buildCountLabel( {
	translate,
	softLimit,
	counterUnit,
	graphemeCount,
	remaining,
}: {
	translate: ReturnType< typeof useTranslate >;
	softLimit: boolean;
	counterUnit: 'graphemes' | 'words';
	graphemeCount: number;
	remaining: number;
} ): string {
	if ( softLimit ) {
		// Soft-limit label: just the count, no "remaining" — the threshold
		// is a soft cue and going past it isn't a budget overrun.
		if ( counterUnit === 'words' ) {
			return translate( '%(count)d word', '%(count)d words', {
				count: graphemeCount,
				args: { count: graphemeCount },
				textOnly: true,
				comment:
					'Composer post-length counter (Fediverse, soft word-counter mode); %(count)d is the integer count of words the user has written. Informational, not a budget.',
			} ) as string;
		}
		return translate( '%(count)d character', '%(count)d characters', {
			count: graphemeCount,
			args: { count: graphemeCount },
			textOnly: true,
			comment:
				'Composer post-length counter (soft mode); %(count)d is the integer count of characters the user has written. Informational, not a budget.',
		} ) as string;
	}
	if ( counterUnit === 'words' ) {
		return translate( '%(count)d word remaining', '%(count)d words remaining', {
			count: remaining,
			args: { count: remaining },
			textOnly: true,
			comment:
				'Composer post-length counter (word-counter mode); %(count)d is the integer count of words still allowed before the limit. Negative when the user is over the limit.',
		} ) as string;
	}
	return translate( '%(count)d character remaining', '%(count)d characters remaining', {
		count: remaining,
		args: { count: remaining },
		textOnly: true,
		comment:
			'Composer post-length counter; %(count)d is the integer count of characters still allowed before the limit. Negative when the user is over the limit.',
	} ) as string;
}

export function ComposerFooter( {
	graphemeCount,
	onSubmit,
	isPending,
	limit,
	disabled: disabledProp,
	footerStart,
	counterUnit = 'graphemes',
	softLimit = false,
}: Props ) {
	const translate = useTranslate();
	const remaining = limit - graphemeCount;
	const tooLong = remaining < 0;
	const empty = graphemeCount === 0;
	// `softLimit: true` means going past the threshold doesn't block submit —
	// the user sees the overflow-handoff section as a suggestion, not a wall.
	const overLimitBlocksSubmit = tooLong && ! softLimit;
	const disabled = disabledProp ?? ( isPending || overLimitBlocksSubmit || empty );

	// Soft-limit (Fediverse) counts up — the threshold is informational, so
	// "127 words" reads naturally as a length indicator. Hard-cap protocols
	// count down so the user can see how much of their budget remains.
	const displayCount = softLimit ? graphemeCount : remaining;

	const countClass = clsx( 'social-composer__count', {
		// Warn/over styling only applies to hard-cap protocols — for soft
		// limits, the overflow-handoff section is the visual cue, and a
		// red count would suggest "you can't post" which isn't true.
		'is-warn': ! softLimit && remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		'is-over': ! softLimit && remaining <= 0,
	} );

	const countLabel = buildCountLabel( {
		translate,
		softLimit,
		counterUnit,
		graphemeCount,
		remaining,
	} );

	return (
		<HStack className="social-composer__footer" justify="space-between" alignment="center">
			<div className="social-composer__footer-left">{ footerStart ?? null }</div>
			<HStack spacing={ 2 } className="social-composer__footer-right">
				<span
					id="social-composer-count"
					className={ countClass }
					// Only announce when the user is near or past the limit so
					// screen readers don't read out the count on every keystroke.
					// Soft-limit protocols don't have a meaningful near-limit
					// state, so the live region stays off.
					aria-live={ ! softLimit && remaining <= WARN_THRESHOLD_REMAINING ? 'polite' : 'off' }
					// Visible text is the bare integer; the accessible label
					// adds units so the live-region announcement is meaningful
					// without relying on the surrounding visual context.
					aria-label={ countLabel }
				>
					{ displayCount }
				</span>
				<Button
					variant="primary"
					disabled={ disabled }
					onClick={ onSubmit }
					// Visible label is the accessible name in the idle and
					// over-limit states; while pending the visible text is
					// replaced by a presentation-only spinner, so the button
					// needs an explicit accessible name.
					aria-label={ isPending ? translate( 'Posting…' ) : undefined }
				>
					{ isPending && <Spinner /> }
					{ /*
					 * Soft-limit protocols (Fediverse) keep the "Post" label
					 * past the threshold — the overflow-handoff section is the
					 * meaningful cue, not the button copy. Hard-cap protocols
					 * (Atmosphere / Mastodon) switch to the blog-post hint
					 * because the button is also disabled there and the label
					 * is the user's only signal.
					 */ }
					{ ! isPending && tooLong && ! softLimit && translate( 'Better as a blog post' ) }
					{ ! isPending && ( ! tooLong || softLimit ) && translate( 'Post' ) }
				</Button>
			</HStack>
		</HStack>
	);
}
