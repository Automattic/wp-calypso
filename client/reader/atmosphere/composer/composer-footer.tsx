import { __experimentalHStack as HStack, Button, Spinner } from '@wordpress/components';
import { Icon, image } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface Props {
	graphemeCount: number;
	onSubmit: () => void;
	isPending: boolean;
	limit: number;
}

const WARN_THRESHOLD_REMAINING = 50;

export function ComposerFooter( { graphemeCount, onSubmit, isPending, limit }: Props ) {
	const translate = useTranslate();
	const remaining = limit - graphemeCount;
	const tooLong = remaining < 0;
	const empty = graphemeCount === 0;
	const disabled = isPending || tooLong || empty;

	const countClass = clsx( 'atmosphere-composer__count', {
		'is-warn': remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		'is-over': remaining <= 0,
	} );

	return (
		<HStack className="atmosphere-composer__footer" justify="space-between" alignment="center">
			<div className="atmosphere-composer__footer-left">
				{ /* Slice 8 wires this up — image / video upload + alt-text + content warnings. */ }
				<button
					type="button"
					className="atmosphere-composer__media"
					aria-disabled="true"
					tabIndex={ 0 }
					aria-label={ translate( 'Add media' ) }
				>
					<Icon icon={ image } size={ 18 } />
				</button>
			</div>
			<HStack spacing={ 2 } className="atmosphere-composer__footer-right">
				<span
					id="atmosphere-composer-count"
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
