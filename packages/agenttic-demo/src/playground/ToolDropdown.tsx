import React, { useEffect, useRef, useState } from 'react';

interface ToolDropdownProps {
	label: string;
	/** Panel content; the render-prop form receives a close() callback. */
	children:
		| React.ReactNode
		| ( ( args: { close: () => void } ) => React.ReactNode );
}

/**
 * A toolbar dropdown: a `playground-tool` trigger with a floating panel,
 * closing on outside click or Escape. Shared by the Messages tester and the
 * Suggestions picker.
 *
 * @param props          Component props.
 * @param props.label
 * @param props.children
 */
export function ToolDropdown( { label, children }: ToolDropdownProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const wrapperRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		const handleClickOutside = ( e: MouseEvent ) => {
			if (
				wrapperRef.current &&
				! wrapperRef.current.contains( e.target as Node )
			) {
				setIsOpen( false );
			}
		};

		const handleEscape = ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' ) {
				setIsOpen( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );
		document.addEventListener( 'keydown', handleEscape );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
			document.removeEventListener( 'keydown', handleEscape );
		};
	}, [ isOpen ] );

	return (
		<div ref={ wrapperRef } className="tool-dropdown">
			<button
				type="button"
				className="playground-tool"
				aria-pressed={ isOpen }
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( prev ) => ! prev ) }
			>
				{ label } { isOpen ? '▴' : '▾' }
			</button>

			{ isOpen && (
				<div className="tool-dropdown__panel">
					{ typeof children === 'function'
						? children( { close: () => setIsOpen( false ) } )
						: children }
				</div>
			) }
		</div>
	);
}
