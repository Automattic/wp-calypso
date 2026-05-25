import type { BaseIconProps } from './types';

interface AspectRatioIconProps extends BaseIconProps {
	ratio: string; // e.g., "1:1", "16:9", "9:16", "4:3", "3:4"
}

export function AspectRatioIcon( { className, size = 24, ratio }: AspectRatioIconProps ) {
	const [ width, height ] = ratio.split( ':' ).map( Number );
	const viewBoxSize = 24;
	const padding = 2;
	const availableSize = viewBoxSize - padding * 2;

	// Calculate dimensions maintaining aspect ratio within the viewBox
	let rectWidth: number;
	let rectHeight: number;

	if ( width === height ) {
		// Square
		rectWidth = availableSize;
		rectHeight = availableSize;
	} else if ( width > height ) {
		// Landscape (16:9, 4:3)
		rectWidth = availableSize;
		rectHeight = ( availableSize * height ) / width;
	} else {
		// Portrait (9:16, 3:4)
		rectHeight = availableSize;
		rectWidth = ( availableSize * width ) / height;
	}

	const x = padding + ( availableSize - rectWidth ) / 2;
	const y = padding + ( availableSize - rectHeight ) / 2;

	return (
		<svg
			width={ size }
			height={ size }
			viewBox={ `0 0 ${ viewBoxSize } ${ viewBoxSize }` }
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
			aria-hidden="true"
		>
			<rect
				x={ x }
				y={ y }
				width={ rectWidth }
				height={ rectHeight }
				rx="1"
				stroke="currentColor"
				strokeWidth="1.5"
				fill="none"
			/>
		</svg>
	);
}
