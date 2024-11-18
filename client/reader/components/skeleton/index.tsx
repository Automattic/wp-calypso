import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface Props extends React.HTMLAttributes< HTMLDivElement > {
	shape?: 'circle' | 'rect';
	height?: string;
	width?: string;
}

const Skeleton = ( { shape = 'rect', height, width, style, className, ...rest }: Props ) => {
	const classes = clsx(
		'skeleton',
		{
			'skeleton--circle': shape === 'circle',
		},
		className
	);

	const styles = {
		...style,
		...( height && { height } ),
		...( width && { width } ),
	};

	return <div { ...rest } className={ classes } style={ styles }></div>;
};

export default Skeleton;
