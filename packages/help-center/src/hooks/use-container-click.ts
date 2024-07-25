import { useEffect } from '@wordpress/element';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const isThisASupportArticleLink = ( href: string ) =>
	/wordpress\.com(\/\w\w)?(?=\/support\/)|support\.wordpress\.com/.test( href );

export const useContainerClick = ( node: HTMLDivElement | null ) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [ searchParams ] = useSearchParams();
	const link = searchParams.get( 'link' ) || '';

	const filters = [
		/**
		 * Fix table of content jump-to links.
		 */
		{
			pattern: '.toc-parent-list a',
			action: ( element: HTMLAnchorElement ) => {
				const href = element.getAttribute( 'href' );
				if ( href?.startsWith( '#' ) ) {
					element.onclick = ( event: Event ) => {
						event.preventDefault();
						const target = node?.querySelector( href );
						if ( target ) {
							target.scrollIntoView();
						}
					};
				}
			},
		},

		/**
		 * Make support article links open within Help Center.
		 */
		{
			pattern: 'a[href*="wordpress.com"], a[href^="/"]',
			action: ( element: HTMLAnchorElement ) => {
				if ( ! element.href.startsWith( '/' ) && ! isThisASupportArticleLink( element.href ) ) {
					return;
				}

				if ( element.href.startsWith( '/' ) ) {
					element.href = new URL( element.href, link ).href;
				}

				element.onclick = ( event: Event ) => {
					event.preventDefault();
					navigate( `/post?link=${ element.href }` );
				};
			},
		},
	];

	useEffect( () => {
		// Currently only apply this to article pages.
		// Later we can apply to Wapuu.
		if ( pathname === '/post/' && node ) {
			filters.forEach( ( { pattern, action } ) => {
				( node.querySelectorAll( pattern ) as NodeListOf< HTMLAnchorElement > ).forEach(
					( element ) => {
						action( element );
					}
				);
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ node, pathname ] );
};
