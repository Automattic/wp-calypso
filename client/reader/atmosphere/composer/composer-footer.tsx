import { __experimentalHStack as HStack, Button, Spinner } from '@wordpress/components';
import { Icon, image } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useComposer } from './composer-provider';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from './media/constants';

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
}

const WARN_THRESHOLD_REMAINING = 50;

export function ComposerFooter( {
	graphemeCount,
	onSubmit,
	isPending,
	limit,
	disabled: disabledProp,
}: Props ) {
	const translate = useTranslate();
	const { images, addFiles } = useComposer();
	const inputRef = useRef< HTMLInputElement >( null );
	const atMax = images.length >= MAX_IMAGES;
	const remaining = limit - graphemeCount;
	const tooLong = remaining < 0;
	const empty = graphemeCount === 0;
	const disabled = disabledProp ?? ( isPending || tooLong || empty );

	const countClass = clsx( 'atmosphere-composer__count', {
		'is-warn': remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		'is-over': remaining <= 0,
	} );

	return (
		<HStack className="atmosphere-composer__footer" justify="space-between" alignment="center">
			<div className="atmosphere-composer__footer-left">
				<button
					type="button"
					className="atmosphere-composer__media"
					aria-disabled={ atMax || undefined }
					aria-label={
						atMax
							? ( translate( 'Maximum %(count)d images', {
									args: { count: MAX_IMAGES },
									comment:
										'Tooltip on the composer "Add media" button when the user has reached the per-post image cap; %(count)d is the maximum number of images allowed on a single post.',
							  } ) as string )
							: ( translate( 'Add media' ) as string )
					}
					onClick={ () => {
						if ( ! atMax ) {
							inputRef.current?.click();
						}
					} }
				>
					<Icon icon={ image } size={ 18 } />
				</button>
				<input
					ref={ inputRef }
					type="file"
					accept={ ACCEPTED_IMAGE_TYPES }
					multiple
					hidden
					onChange={ ( e ) => {
						const files = Array.from( e.target.files ?? [] );
						if ( files.length > 0 ) {
							addFiles( files );
						}
						// Reset so picking the same file again still triggers onChange.
						e.target.value = '';
					} }
				/>
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
