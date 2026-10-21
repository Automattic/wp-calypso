import { Button, Dropdown } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useId, useRef, type ReactNode } from 'react';

interface PopoverContentContext {
	onClose: () => void;
	/** id to set on the popover's heading so the dialog has an accessible name. */
	headingId: string;
}

interface Props {
	icon: ReactNode;
	label: string;
	ariaLabel: string;
	onOpen?: () => void;
	popoverContent: ( ctx: PopoverContentContext ) => ReactNode;
	className?: string;
}

/**
 * Compact footer pill that opens a popover. Used by per-protocol composer
 * extras slots (Atmosphere's reply/quote gates, Mastodon's visibility/CW).
 * Wraps @wordpress/components' Dropdown — focus trap, ESC, click-outside
 * handling come for free.
 */
export function ComposerExtrasPill( {
	icon,
	label,
	ariaLabel,
	onOpen,
	popoverContent,
	className,
}: Props ) {
	// Track previous open state so we only fire onOpen on false→true edges.
	const wasOpenRef = useRef( false );
	const handleToggle = useCallback(
		( isOpen: boolean ) => {
			const shouldFire = isOpen && ! wasOpenRef.current;
			wasOpenRef.current = isOpen;
			if ( shouldFire ) {
				onOpen?.();
			}
		},
		[ onOpen ]
	);

	const headingId = useId();

	return (
		<Dropdown
			className={ clsx( 'composer-extras-pill', className ) }
			popoverProps={ { placement: 'top-start' } }
			onToggle={ handleToggle }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					variant="tertiary"
					size="compact"
					className="composer-extras-pill__trigger"
					aria-haspopup="dialog"
					aria-expanded={ isOpen }
					aria-label={ `${ ariaLabel }, ${ label }` }
					onClick={ onToggle }
				>
					{ icon && <span className="composer-extras-pill__icon">{ icon }</span> }
					<span className="composer-extras-pill__label">{ label }</span>
					<Icon icon={ chevronDown } size={ 16 } />
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div className="composer-extras-pill__content" role="dialog" aria-labelledby={ headingId }>
					{ popoverContent( { onClose, headingId } ) }
				</div>
			) }
		/>
	);
}
