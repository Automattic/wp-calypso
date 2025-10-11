import React, { useEffect, useState } from 'react';
import styles from './ImageRenderer.module.css';
import { motion } from 'framer-motion';
import { CheckIcon } from '../icons/CheckIcon';
import { cn } from '../../utils/classNames';

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

	const handleImageClick = ( image: ImageData ) => {
		setSelectedUrl( image.url );
		onSelect( image );
	};

	// Reset selected image when clicking outside the component
	useEffect( () => {
		window.addEventListener( 'click', () => {
			setSelectedUrl( null );
			onSelect( null );
		} );
	}, [ onSelect ] );

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
						className={ cn(
							styles.imageButton,
							! disabled && selectedUrl === image.url
								? styles.selected
								: '',
							disabled ? styles.disabled : ''
						) }
						onClick={ ( e ) => {
							e.stopPropagation();
							handleImageClick( image );
						} }
						disabled={ disabled }
						type="button"
					>
						<img
							src={ image.url }
							alt={ image.alt }
							className={ styles.image }
						/>
					</button>
				) ) }
			</div>
		</motion.div>
	);
};

export default ImageRenderer;
