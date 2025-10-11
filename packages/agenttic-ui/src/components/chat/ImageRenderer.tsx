import React, { useEffect, useState } from 'react';
import styles from './ImageRenderer.module.css';
import { motion } from 'framer-motion';
import { CheckIcon } from '../icons/CheckIcon';

export interface ImageData {
	url: string;
	description: string;
}

export interface ImageRendererProps {
	images: ImageData[];
	onSelect: ( image: ImageData | null ) => void;
	header?: string | React.ReactNode;
}

export const ImageRenderer: React.FC< ImageRendererProps > = ( {
	images,
	onSelect,
	header,
} ) => {
	const [ selectedUrl, setSelectedUrl ] = useState< string | null >( null );

	const handleImageClick = ( image: ImageData ) => {
		if ( selectedUrl === image.url ) {
			setSelectedUrl( null );
			onSelect( null );
			return;
		}

		setSelectedUrl( image.url );
		onSelect( image );
	};

	// Reset selected image when clicking outside the component
	useEffect( () => {
		window.addEventListener( 'click', () => {
			setSelectedUrl( null );
		} );
	}, [] );

	return (
		<motion.div>
			{ header ? (
				header
			) : (
				<div className={ styles.header }>
					<CheckIcon /> Done
				</div>
			) }
			<div className={ styles.container }>
				{ images.map( ( image ) => (
					<button
						key={ image.url }
						className={ `${ styles.imageButton } ${
							selectedUrl === image.url ? styles.selected : ''
						}` }
						onClick={ ( e ) => {
							e.stopPropagation();
							handleImageClick( image );
						} }
						type="button"
					>
						<img
							src={ image.url }
							alt={ image.description }
							className={ styles.image }
						/>
					</button>
				) ) }
			</div>
		</motion.div>
	);
};

export default ImageRenderer;
