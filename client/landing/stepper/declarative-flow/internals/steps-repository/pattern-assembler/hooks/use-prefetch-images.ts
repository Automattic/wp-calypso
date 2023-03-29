import { useEffect } from 'react';

const IMAGE_URLS = [
	'https://dotcompatterns.files.wordpress.com/2023/03/header-mountains.jpeg',

	'https://blankcanvas3demo.files.wordpress.com/2023/03/mountains_landscape.jpeg?w=1024',
	'https://blankcanvas3demo.files.wordpress.com/2023/03/mountains_landscape.jpeg',
	'https://dotcompatterns.files.wordpress.com/2023/03/mountains_landscape.jpeg?w=1024',
	'https://dotcompatterns.files.wordpress.com/2023/03/mountains_landscape.jpeg',

	'https://dotcompatterns.files.wordpress.com/2023/03/mountains_portrait.jpeg?w=640',
	'https://dotcompatterns.files.wordpress.com/2023/03/mountains_portrait.jpeg',

	'https://dotcompatterns.files.wordpress.com/2023/03/mountains_square.jpeg?w=800',
];

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
		IMAGE_URLS.forEach( ( url ) => prefetchImage( url ) );
		return () => {
			IMAGE_URLS.forEach( ( url ) => removeLinks( url ) );
		};
	}, [] );
};
