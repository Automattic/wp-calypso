import * as React from 'react';
import './loading-placeholder.scss';

interface LoadingPlaceholderProps {
	style?: React.CSSProperties;
	delayMS?: number;
	display?: 'block' | 'inline-block';
	width?: string | number;
	height?: string | number;
	minHeight?: string | number;
	borderRadius?: string;
}

const LoadingPlaceholder = ( {
	style = {},
	delayMS = 0,
	display = 'block',
	width = '100%',
	height,
	minHeight,
	borderRadius,
}: LoadingPlaceholderProps ) => {
	return (
		<div
			className="loading-placeholder"
			style={ {
				...style,
				animationDelay: `${ delayMS }ms`,
				...( display && { display } ),
				...( width && { width } ),
				...( height && { height } ),
				...( minHeight && { minHeight } ),
				...( borderRadius && { borderRadius } ),
			} }
		/>
	);
};

export default LoadingPlaceholder;
