import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import classnames from 'classnames';
import { ReactChild, useRef, useEffect } from 'react';

import './style.scss';

export default function SwipeGroup( {
	children,
	className = '',
	onClick = () => null,
	initialActiveIndex = -1,
}: {
	children: ReactChild[];
	className?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
} ) {
	const classes = classnames( 'responsive-toolbar-group__swipe', className );

	// Scroll to category on load
	const ref = useRef< HTMLButtonElement | null >( null );
	useEffect( () => {
		if ( ref.current ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [] );

	// Scroll to the beginning when activeIndex changes to 0. This indicates a state reset.
	useEffect( () => {
		if ( ref.current && initialActiveIndex === 0 ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [ initialActiveIndex ] );

	return (
		<div className={ classes }>
			<ToolbarGroup className="responsive-toolbar-group__swipe-list">
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						id={ `button-item-${ index }` }
						isActive={ initialActiveIndex === index }
						ref={ initialActiveIndex === index ? ref : null }
						onClick={ () => {
							onClick( index );
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
