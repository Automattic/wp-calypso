import { useEffect } from 'react';

/**
 * Prefetches the images that can be bottleneck for the pattern rendering.
 */
export const usePrefetchImage = () => {
	const prefetchImage = ( url: string ) => {
		const link = document.createElement( 'link' );
		link.rel = 'prefetch';
		link.as = 'image';
		link.href = url;
		document.head.appendChild( link );
	};

	const removeLinks = ( url: string ) => {
		const link = document.querySelector( `link[href="${ url }"]` );
		if ( link ) {
			document.head.removeChild( link );
		}
	};

	useEffect( () => {
		const IMAGE_URLS = [
			'https://dotcompatterns.files.wordpress.com/2022/07/header-mountains.jpeg',

			'https://blankcanvas3demo.files.wordpress.com/2023/01/mountains_landscape.jpg?w=1024',
			'https://blankcanvas3demo.files.wordpress.com/2023/01/mountains_landscape.jpg',
			'https://dotcompatterns.files.wordpress.com/2023/02/mountains_landscape.jpg?w=1024',
			'https://dotcompatterns.files.wordpress.com/2023/02/mountains_landscape.jpg',

			'https://dotcompatterns.files.wordpress.com/2023/02/mountains_portrait.jpg?w=640',
			'https://dotcompatterns.files.wordpress.com/2023/02/mountains_portrait.jpg',

			'https://dotcompatterns.files.wordpress.com/2023/02/mountains_square.jpg?w=800',
		];
		IMAGE_URLS.forEach( ( url ) => prefetchImage( url ) );
		return () => {
			IMAGE_URLS.forEach( ( url ) => removeLinks( url ) );
		};
	}, [] );
};
