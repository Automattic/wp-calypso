import React, { useEffect, useRef, useState } from 'react';
import styles from './AgentUIInputToolbar.module.css';

export interface AgentUIInputToolbarProps {
	children?: React.ReactNode;
	className?: string;
	label?: string;
}

export function AgentUIInputToolbar( {
	children,
	className,
	label,
}: AgentUIInputToolbarProps = {} ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );

	// Handle click outside to close dropdown
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			if (
				containerRef.current &&
				! containerRef.current.contains( event.target as Node )
			) {
				setIsOpen( false );
			}
		};

		if ( isOpen ) {
			document.addEventListener( 'mousedown', handleClickOutside );
			return () => {
				document.removeEventListener( 'mousedown', handleClickOutside );
			};
		}
	}, [ isOpen ] );

	return (
		<div ref={ containerRef } className={ className }>
			<div className={ styles.container }>
				<button
					type="button"
					onClick={ () => setIsOpen( ! isOpen ) }
					className={ styles.button }
				>
					<span>{ label ?? 'Input Toolbar' }</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
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
					<div className={ styles.dropdown }>{ children }</div>
				) }
			</div>
		</div>
	);
}
