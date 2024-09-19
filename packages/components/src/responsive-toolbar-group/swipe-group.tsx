import { ToolbarGroup, ToolbarButton as BaseToolbarButton } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode, useState, useRef, useEffect } from 'react';
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
	hrefList = [],
}: {
	children: ReactNode[];
	className?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
	hrefList?: string[];
} ) {
	const classes = clsx( 'responsive-toolbar-group__swipe', className );

	const [ activeIndex, setActiveIndex ] = useState< number >( initialActiveIndex );

	// Set active on prop change from above
	useEffect( () => {
		setActiveIndex( initialActiveIndex );
	}, [ initialActiveIndex ] );
	const ref = useRef< HTMLAnchorElement >( null );

	// Scroll to category on load
	useEffect( () => {
		if ( ref.current ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [] );

	// Scroll to the beginning when activeIndex changes to 0. This indicates a state reset.
	useEffect( () => {
		if ( ref.current && activeIndex === 0 ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [ activeIndex ] );

	return (
		<div className={ classes }>
			<ToolbarGroup className="responsive-toolbar-group__swipe-list">
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						id={ `button-item-${ index }` }
						isActive={ activeIndex === index }
						href={ hrefList[ index ] }
						ref={ activeIndex === index ? ref : null }
						onClick={ ( event: React.MouseEvent ) => {
							setActiveIndex( index );
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
