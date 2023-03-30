import { useEffect, useRef } from 'react';

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
export const usePrefetchImages = () => {
	const linksRef = useRef< HTMLLinkElement[] >( [] );

	const prefetchImage = ( url: string ) => {
		const link = document.createElement( 'link' );
		link.rel = 'prefetch';
		link.as = 'image';
		link.href = url;
		document.head.appendChild( link );
		return link;
	};

	const removeLinks = ( link: HTMLLinkElement ) => {
		document.head.removeChild( link );
	};

	useEffect( () => {
		const newLinks = IMAGE_URLS.map( ( url ) => prefetchImage( url ) );
		linksRef.current = [ ...linksRef.current, ...newLinks ];

		return () => {
			linksRef.current.forEach( ( link ) => removeLinks( link ) );
		};
	}, [] );
};
