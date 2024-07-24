import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const isThisASupportArticleLink = ( href: string ) =>
	/wordpress\.com(\/\w\w)?(?=\/support\/)|support\.wordpress\.com/.test( href );

export const useContainerClick = ( node: HTMLDivElement | null ) => {
	const navigate = useNavigate();

	const filters = useMemo(
		() => [
			/**
			 * Make support article links open within Help Center.
			 */
			{
				condition: ( target: HTMLElement ) =>
					target.tagName === 'A' &&
					isThisASupportArticleLink( target.getAttribute( 'href' ) || '' ),
				action: ( event: MouseEvent, target: HTMLElement ) => {
					event.preventDefault();
					const href = target.getAttribute( 'href' );
					navigate( `/post?link=${ href }` );
				},
			},

			/**
			 * Fix table of content links.
			 */
			{
				condition: ( target: HTMLElement ) =>
					target.tagName === 'A' && target.closest( '.a8c-table-of-contents' ),
				action: ( event: MouseEvent, target: HTMLElement ) => {
					event.preventDefault();
					const href = target.getAttribute( 'href' );
					const hash = href?.split( '#' )[ 1 ];
					node?.querySelector( `#${ hash }` )?.scrollIntoView();
				},
			},
		],
		[ node, navigate ]
	);

	useEffect( () => {
		node?.addEventListener( 'click', ( event: MouseEvent ) => {
			const target = event.target as HTMLElement;

			filters.forEach( ( { condition, action } ) => {
				if ( condition( target ) ) {
					action( event, target );
				}
			} );
		} );
	}, [ node ] );
};
