/**
 * AmplifyInfoPopover
 *
 * Small reusable wrapper around the existing A4APopover / A4AInfoModal
 * primitives. Bundles the "clickable info-outline icon → popover (or modal
 * on mobile)" pattern that exists hand-rolled in at least three other A4A
 * sections today (consolidated-stats-card, referrals/assigned-to,
 * woopayments/site-columns).
 *
 * Scoped to the amplify section for this PR to keep the diff focused — once
 * we're happy with the API, this should be promoted to
 * `client/a8c-for-agencies/components/a4a-info-popover/` so the three
 * existing call sites can migrate off their inlined copies.
 */

import { Gridicon } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import InfoModal from 'calypso/a8c-for-agencies/components/a4a-info-modal';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import type { ReactNode } from 'react';

import './style.scss';

/**
 * Render-prop API exposed to children that need to close the popover from
 * within — e.g. a CTA inside the popover body that, when clicked, kicks off
 * an action that should clearly transition the user away from the popover
 * (opening a modal, navigating, etc.). Pass children as `({ close }) => …`
 * to opt in.
 */
type ChildrenRenderProps = {
	close: () => void;
};

type Props = {
	/**
	 * Body rendered inside the popover (desktop) or modal (mobile). Accepts
	 * either plain ReactNode (when no programmatic close is needed) or a
	 * function that receives `{ close }` — use the function form when the
	 * body contains an action that should also dismiss the popover.
	 */
	children: ReactNode | ( ( api: ChildrenRenderProps ) => ReactNode );
	/**
	 * Title shown above the popover/modal body. Pass an empty string (the
	 * default) to omit it — useful when the content is short enough to stand
	 * on its own.
	 */
	title?: string;
	/** Icon size in pixels. */
	iconSize?: number;
	/**
	 * Distance in pixels from the trigger to the popover. The 8px default
	 * matches what the referrals dashboard's `assigned-to` component uses,
	 * which is the closest visual sibling to this one.
	 */
	offset?: number;
	/** Optional className applied to the trigger wrapper. */
	className?: string;
	/**
	 * Accessible label for the icon button. Defaults to "More info" —
	 * override when the surrounding label already carries the same meaning
	 * and you need something more specific for screen readers.
	 */
	ariaLabel?: string;
};

export default function AmplifyInfoPopover( {
	children,
	title = '',
	iconSize = 16,
	offset = 8,
	className,
	ariaLabel,
}: Props ) {
	const isMobile = useMobileBreakpoint();
	const wrapperRef = useRef< HTMLSpanElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	// Stable refs across renders — consumers can safely include them in
	// useCallback / useMemo deps without forcing re-runs every render.
	const open = useCallback( () => setIsOpen( true ), [] );
	const close = useCallback( () => setIsOpen( false ), [] );

	return (
		<>
			<span
				ref={ wrapperRef }
				className={ clsx( 'amplify-info-popover__trigger', className ) }
				role="button"
				tabIndex={ 0 }
				aria-label={ ariaLabel ?? __( 'More info' ) }
				aria-haspopup="dialog"
				aria-expanded={ isOpen }
				onClick={ open }
				onKeyDown={ ( event ) => {
					// Enter and Space both activate the trigger, matching the
					// default behavior of a native <button>. We preventDefault on
					// Space so the page doesn't scroll when the trigger is
					// focused via keyboard.
					if ( event.key === 'Enter' || event.key === ' ' ) {
						event.preventDefault();
						open();
					}
				} }
			>
				<Gridicon icon="info-outline" size={ iconSize } />
			</span>
			{ /* Body is resolved inline inside the isOpen branch so the render-
			    prop form isn't invoked (and its JSX subtree isn't allocated)
			    on renders where the popover isn't actually shown. */ }
			{ isOpen &&
				( isMobile ? (
					<InfoModal title={ title } onClose={ close }>
						{ typeof children === 'function' ? children( { close } ) : children }
					</InfoModal>
				) : (
					<A4APopover
						title={ title }
						wrapperRef={ wrapperRef }
						offset={ offset }
						onFocusOutside={ close }
					>
						{ typeof children === 'function' ? children( { close } ) : children }
					</A4APopover>
				) ) }
		</>
	);
}
