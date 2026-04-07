import './style.scss';
import clsx from 'clsx';
import { useState } from 'react';

interface PreloadedImageProps {
	borderRadius?: string;
	className?: string;
	src: string;
	alt?: string;
	width: number;
	height: number;
}

/**
 * PreloadedImage is a wrapper around the HTML img element which only displays the image once it has been fully loaded.
 * This is useful to prevent layout shifts and display a placeholder while the image is loading.
 */
export default function PreloadedImage( props: PreloadedImageProps ) {
	const { src, alt, className, width, height, borderRadius } = props;
	const [ isLoaded, setIsLoaded ] = useState( false );

	return (
		<div className="preloaded-image-wrapper" style={ { borderRadius } }>
			<img
				className={ clsx( className, { 'is-loaded': isLoaded } ) }
				src={ src }
				alt={ isLoaded ? alt : '' }
				width={ width }
				height={ height }
				onLoad={ () => setIsLoaded( true ) }
			/>
		</div>
	);
}
