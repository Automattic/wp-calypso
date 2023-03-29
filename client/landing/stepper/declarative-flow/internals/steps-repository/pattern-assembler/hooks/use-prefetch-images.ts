import { useEffect, useState } from 'react';

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
	const [ links, setLinks ] = useState< HTMLLinkElement[] >( [] );

	const prefetchImage = ( url: string, links: HTMLLinkElement[] ) => {
		const link = document.createElement( 'link' );
		link.rel = 'prefetch';
		link.as = 'image';
		link.href = url;
		document.head.appendChild( link );
		setLinks( [ ...links, link ] );
	};

	const removeLinks = ( link: HTMLLinkElement ) => {
		document.head.removeChild( link );
	};

	useEffect( () => {
		IMAGE_URLS.forEach( ( url ) => {
			prefetchImage( url, links );
		} );
	}, [] );

	useEffect( () => {
		return () => {
			links.forEach( ( link ) => removeLinks( link ) );
		};
	}, [ links ] );
};
