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
	fallbackIcon?: React.ReactNode | string; // Can be a URL string or a JSX element to render when the image fails to load.
}

/**
 * PreloadedImage is a wrapper around the HTML img element which only displays the image once it has been fully loaded.
 * This is useful to prevent layout shifts, displaying incomplete images, and display a placeholder while the image is loading.
 */
export default function PreloadedImage( props: PreloadedImageProps ) {
	const { src, alt, className, width, height, imgStyles, fallbackIcon } = props;
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ hasError, setHasError ] = useState( false );
	const fallbackImage =
		typeof fallbackIcon === 'string' ? (
			<img src={ fallbackIcon } alt={ alt } width={ width } height={ height } />
		) : (
			fallbackIcon
		);

	return (
		<div className="preloaded-image-wrapper" style={ { borderRadius: imgStyles?.borderRadius } }>
			{ ! hasError || ! fallbackIcon ? (
				<img
					className={ clsx( className, { 'is-loaded': isLoaded } ) }
					src={ src }
					alt={ alt }
					width={ width }
					height={ height }
					style={ imgStyles }
					onLoad={ () => setIsLoaded( true ) }
					onError={ () => setHasError( true ) }
				/>
			) : (
				fallbackImage
			) }
		</div>
	);
}
