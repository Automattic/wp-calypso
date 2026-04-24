import './style.scss';
import clsx from 'clsx';
import { useState } from 'react';

interface PreloadedImageProps {
	className?: string;
	src: string;
	alt?: string;
	width: number;
	height: number;
	imgStyles?: React.CSSProperties;
}

/**
 * PreloadedImage is a wrapper around the HTML img element which only displays the image once it has been fully loaded.
 * This is useful to prevent layout shifts, displaying incomplete images, and display a placeholder while the image is loading.
 */
export default function PreloadedImage( props: PreloadedImageProps ) {
	const { src, alt, className, width, height, imgStyles } = props;
	const [ isLoaded, setIsLoaded ] = useState( false );

	return (
		<div className="preloaded-image-wrapper" style={ { borderRadius: imgStyles?.borderRadius } }>
			<img
				className={ clsx( className, { 'is-loaded': isLoaded } ) }
				src={ src }
				alt={ alt }
				width={ width }
				height={ height }
				style={ imgStyles }
				onLoad={ () => setIsLoaded( true ) }
			/>
		</div>
	);
}
