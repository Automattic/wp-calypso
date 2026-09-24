import { motion } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../utils/classNames';
import { CheckIcon } from '../icons/CheckIcon';
import styles from './ImageRenderer.module.css';

export interface ImageData {
	url: string;
	alt: string;
}

export interface ImageRendererProps {
	images: ImageData[];
	onSelect: ( image: ImageData | null ) => void;
	header?: string | React.ReactNode;
	disabled?: boolean;
}

export const ImageRenderer: React.FC< ImageRendererProps > = ( {
	images,
	onSelect,
	header,
	disabled = false,
} ) => {
	const [ selectedUrl, setSelectedUrl ] = useState< string | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	const handleImageClick = ( image: ImageData ) => {
		setSelectedUrl( image.url );
		onSelect( image );
	};

	// Reset selected image when clicking outside the component
	useEffect( () => {
		if ( disabled || ! selectedUrl ) {
			return;
		}

		const handleClickOutside = ( event: MouseEvent ) => {
			if ( containerRef.current && ! containerRef.current.contains( event.target as Node ) ) {
				setSelectedUrl( null );
				onSelect( null );
			}
		};

		window.addEventListener( 'click', handleClickOutside, true );
		return () => window.removeEventListener( 'click', handleClickOutside, true );
	}, [ onSelect, disabled, selectedUrl ] );

	return (
		<motion.div>
			{ header ? (
				header
			) : (
				<div className={ styles.header }>
					<CheckIcon /> Done
				</div>
			) }
			<div className={ styles.container } ref={ containerRef }>
				{ images.map( ( image ) => (
					<button
						key={ image.url }
						className={ cn(
							styles.imageButton,
							! disabled && selectedUrl === image.url ? styles.selected : '',
							disabled ? styles.disabled : ''
						) }
						onClick={ () => handleImageClick( image ) }
						disabled={ disabled }
						type="button"
					>
						<img src={ image.url } alt={ image.alt } className={ styles.image } />
					</button>
				) ) }
			</div>
		</motion.div>
	);
};

export default ImageRenderer;
