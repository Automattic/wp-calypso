import { ToolbarGroup, ToolbarButton as BaseToolbarButton } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode, useState, useRef, useEffect, useMemo } from 'react';
import type { Button } from '@wordpress/components';

import './style.scss';

const ToolbarButton = BaseToolbarButton as React.ComponentType<
	| ( React.ComponentProps< typeof BaseToolbarButton > & { href?: string } )
	| React.ComponentProps< typeof Button >
>;

export default function SwipeGroup( {
	children,
	className = '',
	onClick = () => null,
	initialActiveIndex = -1,
	initialActiveIndexes,
	isMultiSelection,
	hrefList = [],
}: {
	children: ReactNode[];
	className?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
	initialActiveIndexes?: number[];
	isMultiSelection?: boolean;
	hrefList?: string[];
} ) {
	const classes = clsx( 'responsive-toolbar-group__swipe', className );

	const defaultActiveIndexes = useMemo( () => {
		if ( isMultiSelection ) {
			return initialActiveIndexes || [];
		}

		return initialActiveIndex !== -1 ? [ initialActiveIndex ] : [];
	}, [ isMultiSelection, initialActiveIndex, initialActiveIndexes ] );

	const [ activeIndexes, setActiveIndexes ] = useState< Set< number > >(
		new Set( defaultActiveIndexes )
	);

	// Set active on prop change from above
	useEffect( () => {
		setActiveIndexes( new Set( defaultActiveIndexes ) );
	}, [ defaultActiveIndexes ] );
	const ref = useRef< HTMLAnchorElement >( null );

	// Scroll to category on load
	useEffect( () => {
		if ( ref.current ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [] );

	// Scroll to the beginning when activeIndexes changes to 0. This indicates a state reset.
	useEffect( () => {
		if ( ref.current ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [ activeIndexes ] );

	return (
		<div className={ classes }>
			<ToolbarGroup className="responsive-toolbar-group__swipe-list">
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						id={ `button-item-${ index }` }
						isActive={ activeIndexes.has( index ) }
						href={ hrefList[ index ] }
						ref={ activeIndexes.has( index ) ? ref : null }
						onClick={ ( event: React.MouseEvent ) => {
							setActiveIndexes( ( currentActiveIndexes: Set< number > ) => {
								if ( ! isMultiSelection ) {
									return new Set( [ index ] );
								}

								if ( ! currentActiveIndexes.has( index ) ) {
									currentActiveIndexes.add( index );
								} else if ( currentActiveIndexes.size > 1 ) {
									currentActiveIndexes.delete( index );
								}

								return currentActiveIndexes;
							} );
							onClick( index );

							if ( typeof hrefList[ index ] === 'string' ) {
								event.preventDefault();
							}
						} }
						className="responsive-toolbar-group__swipe-item"
					>
						{ child }
					</ToolbarButton>
				) ) }
			</ToolbarGroup>
		</div>
	);
}
