import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import classnames from 'classnames';
import { ReactChild, useState } from 'react';

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

	return (
		<div className={ classes }>
			<ToolbarGroup className="responsive-toolbar-group__swipe-list">
				{ children.map( ( child, index ) => (
					<ToolbarButton
						key={ `button-item-${ index }` }
						id={ `button-item-${ index }` }
						isActive={ activeIndex === index }
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
