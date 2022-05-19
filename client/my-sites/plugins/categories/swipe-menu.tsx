import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import classnames from 'classnames';
import { ReactChild, useState } from 'react';

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
	const [ activeIndex, setActiveIndex ] = useState< number >( initialActiveIndex );

	return (
		<div className={ classes }>
			<ToolbarGroup className="categories__swipe-menu-list">
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
			</ToolbarGroup>
		</div>
	);
}
