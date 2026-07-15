import React, { useEffect, useRef, useState } from 'react';

/**
 * A "more actions" menu button to demo the `type: 'component'` message action.
 * Renders a `···` button that opens a popover menu with extra options.
 */
export default function DemoMoreMenu() {
	const [ open, setOpen ] = useState( false );
	const ref = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! open ) {
			return;
		}
		const handleClickOutside = ( e: MouseEvent ) => {
			if ( ref.current && ! ref.current.contains( e.target as Node ) ) {
				setOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () =>
			document.removeEventListener( 'mousedown', handleClickOutside );
	}, [ open ] );

	return (
		<div ref={ ref } style={ { position: 'relative', display: 'flex' } }>
			{ /* A plain button: importing the package's `Button` from `src` here
			     would double-bundle its CSS module in `use-ui-build` mode and
			     override the built styles. */ }
			<button
				onClick={ () => setOpen( ( prev ) => ! prev ) }
				aria-label="More actions"
				type="button"
				style={ {
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '24px',
					height: '24px',
					padding: 0,
					background: 'none',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer',
					color: 'var(--color-foreground)',
				} }
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9.58325 14.1667C10.2736 14.1667 10.8333 14.7264 10.8333 15.4167C10.8333 16.1071 10.2736 16.6667 9.58325 16.6667C8.8929 16.6667 8.33325 16.1071 8.33325 15.4167C8.33325 14.7264 8.8929 14.1667 9.58325 14.1667Z"
						fill="currentColor"
					/>
					<path
						d="M9.58325 8.75004C10.2736 8.75004 10.8333 9.30968 10.8333 10C10.8333 10.6904 10.2736 11.25 9.58325 11.25C8.8929 11.25 8.33325 10.6904 8.33325 10C8.33325 9.30968 8.8929 8.75004 9.58325 8.75004Z"
						fill="currentColor"
					/>
					<path
						d="M9.58325 3.33337C10.2736 3.33337 10.8333 3.89302 10.8333 4.58337C10.8333 5.27373 10.2736 5.83337 9.58325 5.83337C8.8929 5.83337 8.33325 5.27373 8.33325 4.58337C8.33325 3.89302 8.8929 3.33337 9.58325 3.33337Z"
						fill="currentColor"
					/>
				</svg>
			</button>
			{ open && (
				<div
					style={ {
						position: 'absolute',
						bottom: '100%',
						left: 0,
						marginBottom: '4px',
						background: 'var(--color-background)',
						border: '1px solid var(--color-muted)',
						borderRadius: '8px',
						padding: '4px 0',
						minWidth: '180px',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
						zIndex: 10,
					} }
				>
					{ [ 'Branch in new chat', 'Read aloud' ].map( ( label ) => (
						<button
							key={ label }
							onClick={ () => {
								console.log( label );
								setOpen( false );
							} }
							style={ {
								display: 'block',
								width: '100%',
								background: 'none',
								border: 'none',
								padding: '8px 12px',
								textAlign: 'left',
								cursor: 'pointer',
								fontSize: '13px',
								color: 'var(--color-foreground)',
							} }
						>
							{ label }
						</button>
					) ) }
				</div>
			) }
		</div>
	);
}
