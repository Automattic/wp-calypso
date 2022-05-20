import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import classnames from 'classnames';
import { ReactChild, useState, useRef, useEffect } from 'react';

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

	const [ activeIndex, setActiveIndex ] = useState< number >( initialActiveIndex );

	// Reset active on prop change from above
	useEffect( () => {
		setActiveIndex( initialActiveIndex );
	}, [ initialActiveIndex ] );

	// Scroll to category on load
	const ref = useRef< HTMLButtonElement | null >( null );
	useEffect( () => {
		if ( ref.current ) {
			ref.current.scrollIntoView( { block: 'end', inline: 'center' } );
		}
	}, [] );

	return (
		<div className={ classes }>
			<ToolbarGroup className="responsive-toolbar-group__swipe-list">
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						id={ `button-item-${ index }` }
						isActive={ activeIndex === index }
						ref={ activeIndex === index ? ref : null }
						onClick={ () => {
							setActiveIndex( index );
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
