import { isSameOrigin } from '@automattic/calypso-url';
import { isThisASupportArticleLink } from '@automattic/urls';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';

function canParse( url: string, baseUrl?: string ): URL | false {
	try {
		return new URL( url, baseUrl );
	} catch {
		return false;
	}
}

/**
 * Temporary: the Odie backend returns links with no protocol.
 * This function ensures that the link has a protocol.
 * @param url - The URL to parse.
 * @param baseUrl - The base URL to use for parsing.
 * @returns The parsed URL or null if the URL is invalid.
 * @todo Remove this function when the Odie backend is updated.
 */
function ensureProtocolAndParse( url: string, baseUrl?: string ) {
	return canParse( url, baseUrl ) || canParse( 'https://' + url, baseUrl );
}

export const useContentFilter = ( node: HTMLDivElement | null ) => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const link = searchParams.get( 'link' ) || '';
	const { site } = useHelpCenterContext();
	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );
	const isDesktop = useViewportMatch( 'medium' );

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

			{
				pattern: 'a[href*="wordpress.com/plans/"], a[href^="/"]',
				action: ( element: HTMLAnchorElement ) => {
					const href = element.getAttribute( 'href' ) as string;
					const currentSiteDomain = site?.domain;

					if ( currentSiteDomain ) {
						element.setAttribute( 'href', new URL( `${ href + currentSiteDomain }` ).href );
					}
				},
			},

			/**
			 * Fix table of content jump-to links.
			 */
			{
				pattern: '.toc-parent-list a, a[href^="#"]',
				action: ( element: HTMLAnchorElement ) => {
					const hash = element.hash;
					const url = ensureProtocolAndParse( hash, link );

					if ( ! url ) {
						// disable the faulty link.
						element.removeAttribute( 'href' );
						return;
					}

					element.setAttribute( 'href', url?.href );
					element.onclick = ( event: Event ) => {
						event.preventDefault();
						// We need to use CSS.escape since we can have non latin chars in the hash
						const target = node?.querySelector( `#${ CSS.escape( hash.slice( 1 ) ) }` );
						if ( target instanceof HTMLElement ) {
							target.setAttribute( 'tabindex', '-1' );
							target.focus( {
								// Let scrollIntoView handle the scrolling.
								// The scroll of focus is a bit buggy in Safari.
								preventScroll: true,
							} );
							target.scrollIntoView( { behavior: 'smooth' } );
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
			/**
			 * Add external link icons to links that open in new tabs.
			 */
			{
				pattern: 'a[target="_blank"]',
				action: ( element: HTMLAnchorElement ) => {
					const href = element.getAttribute( 'href' ) as string;

					if ( ! canParse( href ) ) {
						return;
					}
					// Skip support articles
					if ( href && isThisASupportArticleLink( href ) ) {
						return;
					}

					// Support sites add `target="_blank"` to Calypso links.
					// We should remove that in the context of Calypso.
					if ( isSameOrigin( href ) ) {
						element.removeAttribute( 'target' );
						// On mobile, clicking a local link in the Help Center means the user wants to
						// interact with that linked page, the Help Center should tuck itself away
						// to make the page accessible, because the screen doesn't fit both.
						if ( ! isDesktop ) {
							element.addEventListener( 'click', () => setIsMinimized( true ) );
						}
						return;
					}

					// Create external link icon SVG
					const icon = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
					icon.setAttribute( 'class', 'help-center-external-link-icon' );
					icon.setAttribute( 'width', '16' );
					icon.setAttribute( 'height', '16' );
					icon.setAttribute( 'viewBox', '0 0 24 24' );
					icon.setAttribute( 'aria-hidden', 'true' );

					const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
					path.setAttribute(
						'd',
						'M18.2 17c0 .7-.6 1.2-1.2 1.2H7c-.7 0-1.2-.6-1.2-1.2V7c0-.7.6-1.2 1.2-1.2h3.2V4.2H7C5.5 4.2 4.2 5.5 4.2 7v10c0 1.5 1.2 2.8 2.8 2.8h10c1.5 0 2.8-1.2 2.8-2.8v-3.6h-1.5V17zM14.9 3v1.5h3.7l-6.4 6.4 1.1 1.1 6.4-6.4v3.7h1.5V3h-6.3z'
					);
					icon.appendChild( path );

					// Add screen reader text for accessibility
					const srText = document.createElement( 'span' );
					srText.className = 'screen-reader-text';
					srText.textContent = ` (${ __( 'opens in a new tab', 'help-center' ) })`;

					// Append icon and screen reader text to the link
					element.appendChild( icon );
					element.appendChild( srText );
				},
			},
		],
		[ navigate, link, node, site?.domain, setIsMinimized, isDesktop ]
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
