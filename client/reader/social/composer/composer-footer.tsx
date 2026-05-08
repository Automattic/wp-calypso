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
}

const WARN_THRESHOLD_REMAINING = 50;

export function ComposerFooter( {
	graphemeCount,
	onSubmit,
	isPending,
	limit,
	disabled: disabledProp,
	footerStart,
}: Props ) {
	const translate = useTranslate();
	const remaining = limit - graphemeCount;
	const tooLong = remaining < 0;
	const empty = graphemeCount === 0;
	const disabled = disabledProp ?? ( isPending || tooLong || empty );

	const countClass = clsx( 'social-composer__count', {
		'is-warn': remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		'is-over': remaining <= 0,
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
					aria-live={ remaining <= WARN_THRESHOLD_REMAINING ? 'polite' : 'off' }
					// Visible text is the bare integer; the accessible label
					// adds units so the live-region announcement is meaningful
					// without relying on the surrounding visual context.
					aria-label={ translate(
						'%(count)d character remaining',
						'%(count)d characters remaining',
						{
							count: remaining,
							args: { count: remaining },
							textOnly: true,
							comment:
								'Composer post-length counter; %(count)d is the integer count of characters still allowed before the limit. Negative when the user is over the limit.',
						}
					) }
				>
					{ remaining }
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
					{ ! isPending && tooLong && translate( 'Better as a blog post' ) }
					{ ! isPending && ! tooLong && translate( 'Post' ) }
				</Button>
			</HStack>
		</HStack>
	);
}
