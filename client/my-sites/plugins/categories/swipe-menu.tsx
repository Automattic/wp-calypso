import { Gridicon } from '@automattic/components';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import classnames from 'classnames';
import { ReactChild, useRef, useState } from 'react';

import './style.scss';

export default function SwipeMenu( {
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
	const classes = classnames( 'categories__swipe-menu', className );

	const toolbarRef = useRef< HTMLDivElement | null >( null );

	const [ activeIndex, setActiveIndex ] = useState< number >( initialActiveIndex );

	function scrollRef( ref: typeof toolbarRef, distance: number ) {
		if ( ref?.current ) {
			ref.current.children[ 0 ].scrollLeft += distance;
		}
	}

	return (
		<div className={ classes } ref={ toolbarRef }>
			<ToolbarGroup className="categories__swipe-menu-list">
				<ToolbarButton
					className="categories__swipe-menu-scroll scroll-left"
					onClick={ () => scrollRef( toolbarRef, -100 ) }
				>
					<Gridicon icon="chevron-left" />
				</ToolbarButton>
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						isActive={ activeIndex === index }
						onClick={ () => {
							setActiveIndex( index );
							onClick( index );
						} }
						className="categories__swipe-menu-item"
					>
						{ child }
					</ToolbarButton>
				) ) }
				<ToolbarButton
					className="categories__swipe-menu-scroll scroll-right"
					onClick={ () => scrollRef( toolbarRef, 100 ) }
				>
					<Gridicon icon="chevron-right" />
				</ToolbarButton>
			</ToolbarGroup>
		</div>
	);
}
