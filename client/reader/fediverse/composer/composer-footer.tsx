import { __experimentalHStack as HStack, Button, Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface Props {
	graphemeCount: number;
	onSubmit: () => void;
	isPending: boolean;
	softLimit: number;
}

const WARN_THRESHOLD_REMAINING = 50;

export function ComposerFooter( { graphemeCount, onSubmit, isPending, softLimit }: Props ) {
	const translate = useTranslate();
	const remaining = softLimit - graphemeCount;
	const empty = graphemeCount === 0;
	// For Fediverse Notes there is no hard character limit for v0.1.0.
	// The button is only disabled when the field is empty or while posting.
	const disabled = isPending || empty;

	const countClass = clsx( 'fediverse-composer__count', {
		'is-warn': remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		// Show amber styling when over the soft limit, but never disable the button.
		'is-over': remaining <= 0,
	} );

	return (
		<HStack className="fediverse-composer__footer" justify="space-between" alignment="center">
			<div className="fediverse-composer__footer-left" />
			<HStack spacing={ 2 } className="fediverse-composer__footer-right">
				<span
					id="fediverse-composer-count"
					className={ countClass }
					// Only announce when the user is near or past the soft limit so
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
								'Composer post-length counter; %(count)d is the integer count of characters still allowed before the soft limit. Negative when the user is over the soft limit.',
						}
					) }
				>
					{ remaining }
				</span>
				<Button
					variant="primary"
					disabled={ disabled }
					onClick={ onSubmit }
					// Visible "Post" label is the accessible name in the idle
					// state; while pending the visible text is replaced by a
					// presentation-only spinner, so the button needs an
					// explicit accessible name.
					aria-label={ isPending ? translate( 'Posting…' ) : undefined }
				>
					{ isPending ? <Spinner /> : translate( 'Post' ) }
				</Button>
			</HStack>
		</HStack>
	);
}
