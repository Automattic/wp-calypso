import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { desktop, styles } from '@wordpress/icons';
import clsx from 'clsx';
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

export type CanvasView = 'design' | 'site';

/** Switches the canvas between the design brief and the page renders. */
export function ViewSwitch( {
	view,
	onChange,
}: {
	view: CanvasView;
	onChange: ( view: CanvasView ) => void;
} ) {
	const options = useRef< Record< CanvasView, HTMLButtonElement | null > >( {
		design: null,
		site: null,
	} );
	const items: { value: CanvasView; label: string; icon: typeof styles }[] = [
		{ value: 'design', label: __( 'Design' ), icon: styles },
		{ value: 'site', label: __( 'Preview' ), icon: desktop },
	];

	// Two options, so any arrow key moves to the other one, as in a radio group.
	const handleKeyDown = ( event: KeyboardEvent ) => {
		if ( ! [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
			return;
		}
		event.preventDefault();
		const next = view === 'design' ? 'site' : 'design';
		onChange( next );
		options.current[ next ]?.focus();
	};

	return (
		<div className="site-generation-canvas__views">
			<div
				aria-label={ __( 'Preview view' ) }
				className="site-generation-canvas__view-switch"
				data-active={ view }
				role="radiogroup"
			>
				<span aria-hidden="true" className="site-generation-canvas__view-switch-thumb" />
				{ items.map( ( item ) => (
					<button
						aria-checked={ view === item.value }
						className={ clsx( 'site-generation-canvas__view-switch-option', {
							'is-active': view === item.value,
						} ) }
						key={ item.value }
						onClick={ () => onChange( item.value ) }
						onKeyDown={ handleKeyDown }
						ref={ ( element ) => {
							options.current[ item.value ] = element;
						} }
						role="radio"
						tabIndex={ view === item.value ? 0 : -1 }
						type="button"
					>
						<Icon icon={ item.icon } size={ 20 } />
						{ item.label }
					</button>
				) ) }
			</div>
		</div>
	);
}
