import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useContainerClick = ( node: HTMLDivElement | null ) => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const link = searchParams.get( 'link' ) || '';

	const filters = useMemo(
		() => [
			/**
			 * Make support article links open within Help Center.
			 */
			{
				pattern: '.toc-parent-list a',
				action: ( element ) => {
					const href = element.getAttribute( 'href' );
					if ( href.startsWith( '#' ) ) {
						element.onclick = ( event ) => {
							event.preventDefault();
							const target = node?.querySelector( href );
							if ( target ) {
								target.scrollIntoView();
							}
						};
					}
				},
			},
			{
				pattern: 'a[href^="/"]',
				action: ( element ) => {
					const href = element.getAttribute( 'href' );
					const fixedUrl = new URL( href, link ).href;

					element.href = fixedUrl;
					element.onclick = ( event ) => {
						event.preventDefault();
						navigate( `/post?link=${ fixedUrl }` );
					};
				},
			},
		],
		[ node, link ]
	);

	useEffect( () => {
		if ( node ) {
			const timeout = setTimeout( () => {
				filters.forEach( ( { pattern, action } ) => {
					node.querySelectorAll( pattern ).forEach( action );
				} );
			}, 0 );

			return () => clearTimeout( timeout );
		}
	}, [ node, filters ] );
};
