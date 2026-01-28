import React, { useEffect, useRef, useState } from 'react';
import {
	useFloating,
	flip,
	offset,
	shift,
	autoUpdate,
} from '@floating-ui/react-dom';
import styles from './AgentUIInputToolbar.module.css';

export interface AgentUIInputToolbarProps {
	children?: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
	label?: string;
	disabled?: boolean;
}

export function AgentUIInputToolbar( {
	children,
	className,
	icon,
	label,
	disabled,
}: AgentUIInputToolbarProps = {} ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );
	const dropdownId = React.useId();

	const toggleDropdown = () => {
		setIsOpen( ( prev ) => ! prev );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const { refs, floatingStyles } = useFloating( {
		placement: 'bottom-start',
		transform: true,
		middleware: [
			offset( 8 ),
			flip( {
				fallbackPlacements: [
					'bottom',
					'bottom-end',
					'top-start',
					'top',
					'top-end',
				],
				fallbackStrategy: 'bestFit',
			} ),
			shift( { padding: 8 } ),
		],
		whileElementsMounted: autoUpdate,
	} );

	// Handle click outside to close dropdown
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			if (
				containerRef.current &&
				! containerRef.current.contains( event.target as Node )
			) {
				closeDropdown();
			}
		};

		if ( isOpen ) {
			// Use both mousedown and click to handle all cases
			document.addEventListener( 'mousedown', handleClickOutside );
			return () => {
				document.removeEventListener( 'mousedown', handleClickOutside );
			};
		}
	}, [ isOpen ] );

	// Handle keyboard navigation
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! isOpen ) {
				return;
			}

			if ( event.key === 'Escape' ) {
				event.preventDefault();
				closeDropdown();
				// Return focus to button
				( refs.reference?.current as HTMLElement )?.focus();
			}
		};

		if ( isOpen ) {
			document.addEventListener( 'keydown', handleKeyDown );
			return () => {
				document.removeEventListener( 'keydown', handleKeyDown );
			};
		}
	}, [ isOpen ] );

	// Focus management: focus dropdown when it opens
	useEffect( () => {
		if ( isOpen && refs.floating?.current ) {
			// Focus the dropdown container for keyboard navigation
			( refs.floating?.current as HTMLElement )?.focus();
		}
	}, [ isOpen ] );

	const handleButtonKeyDown = (
		event: React.KeyboardEvent< HTMLButtonElement >
	) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			toggleDropdown();
		}
	};

	const toolbarLabel = label ?? 'Input Toolbar';

	return (
		<div ref={ containerRef } className={ className }>
			<div className={ styles.container }>
				<button
					ref={ refs.setReference }
					type="button"
					onClick={ toggleDropdown }
					onKeyDown={ handleButtonKeyDown }
					className={ styles.button }
					aria-expanded={ isOpen }
					aria-haspopup="true"
					aria-controls={ isOpen ? dropdownId : undefined }
					aria-label={ toolbarLabel }
					disabled={ disabled }
				>
					{ icon }
					<span>{ toolbarLabel }</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
						className={ `${ styles.icon } ${
							isOpen ? styles.iconOpen : ''
						}` }
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M18.0045 10.5549L12 16.0136L5.9955 10.5549L7.00451 9.44504L12 13.9864L16.9955 9.44504L18.0045 10.5549Z"
							fill="currentColor"
						/>
					</svg>
				</button>
				{ isOpen && (
					<div
						ref={ refs.setFloating }
						id={ dropdownId }
						className={ styles.dropdown }
						role="dialog"
						aria-label={ toolbarLabel }
						tabIndex={ -1 }
						style={ floatingStyles }
					>
						{ children }
					</div>
				) }
			</div>
		</div>
	);
}
