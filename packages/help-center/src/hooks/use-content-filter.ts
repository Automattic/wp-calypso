import { useEffect, useMemo } from '@wordpress/element';
import { useNavigate, useSearchParams } from 'react-router-dom';

const isThisASupportArticleLink = ( href: string ) =>
	/wordpress\.com(\/\w\w)?(?=\/support\/)|support\.wordpress\.com/.test( href );

export const useContentFilter = ( node: HTMLDivElement | null ) => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const link = searchParams.get( 'link' ) || '';

	const filters = useMemo(
		() => [
			/**
			 * Make support article links open within the Help Center.
			 */
			{
				pattern: 'a[href*="wordpress.com"], a[href^="/"]',
				action: ( element: HTMLAnchorElement ) => {
					const href = element.getAttribute( 'href' ) as string;

					if ( ! href.startsWith( '/' ) && ! isThisASupportArticleLink( href ) ) {
						return;
					}

					// Remove links from the image.
					const image = element.querySelector( 'img' );
					if ( image ) {
						element.parentNode?.replaceChild( image, element );
					}

					// Make the href absolute to the support guide.
					if ( href.startsWith( '/' ) ) {
						element.setAttribute( 'href', new URL( href, link ).href );
					}

					element.onclick = ( event: Event ) => {
						event.preventDefault();

						navigate( `/post?link=${ element.href }` );
					};
				},
			},

			/**
			 * Fix table of content jump-to links.
			 */
			{
				pattern: '.toc-parent-list a, a[href^="#"]',
				action: ( element: HTMLAnchorElement ) => {
					const hash = element.hash;

					element.setAttribute( 'href', new URL( hash, link ).href );
					element.onclick = ( event: Event ) => {
						event.preventDefault();
						// We need to use CSS.escape since we can have non latin chars in the hash
						const target = node?.querySelector( `#${ CSS.escape( hash.slice( 1 ) ) }` );
						if ( target ) {
							target.scrollIntoView();
						}
					};
				},
			},
			/**
			 * Fix width of VideoPress embeds.
			 */
			{
				pattern: 'iframe[data-wpcom-embed-url*="videopress.com"]',
				action: ( element: HTMLElement ) => {
					const parent = element.parentNode;
					if ( parent ) {
						const width = parseFloat( element.getAttribute( 'width' ) ?? '' );
						const height = parseFloat( element.getAttribute( 'height' ) ?? '' );

						const parentStyle = getComputedStyle( parent as Element );
						const parentWidth = parseFloat( parentStyle.width );
						const preferredHeight = ( height / width ) * parentWidth;

						element.setAttribute( 'width', String( parentWidth ) );
						element.setAttribute( 'height', String( preferredHeight ) );
					}
				},
			},
		],
		[ navigate, link, node ]
	);

	useEffect( () => {
		if ( node ) {
			filters.forEach( ( { pattern, action } ) => {
				( node.querySelectorAll( pattern ) as NodeListOf< HTMLAnchorElement > ).forEach(
					( element ) => {
						action( element );
					}
				);
			} );
		}
	}, [ node, filters ] );
};
