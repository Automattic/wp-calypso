import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useRef, type ElementType, useState, useLayoutEffect, ReactNode, useEffect } from 'react';

type Props = {
	/**
	 * Function that renders the content when the element is stuck
	 * @param isStuck - Indicates if the element is stuck
	 * @returns ReactNode
	 */
	children: ( isStuck: boolean ) => ReactNode;

	/**
	 * CSS class applied when the element is "stuck"
	 */
	stickyClass?: string;

	/**
	 * Element type to render (defaults to div)
	 */
	element?: ElementType;

	/**
	 * Offset from the top of the scrolling container to trigger stickiness (default 0)
	 */
	stickyOffset?: number;

	/**
	 * Set to true to disable sticky behavior
	 */
	disabled?: boolean;

	/**
	 * Manually set z-index. Useful for managing the stacking order of sticky elements when multiple components compete.
	 * Higher z-index values will make the element appear on top of elements with lower z-index values.
	 */
	zIndex?: number;
};

const styles = ( {
	disabled,
	stickyOffset,
	stickyPadding,
	zIndex,
}: {
	disabled: boolean;
	stickyOffset: number;
	stickyPadding: number;
	zIndex: number;
} ) =>
	disabled
		? ''
		: css`
				position: sticky;
				top: ${ stickyOffset - stickyPadding + 'px' };
				z-index: ${ zIndex };
		  `;

const Container = styled.div`
	${ styles }
`;

/**
 * Renders a sticky container.
 *
 * The following is an illustration on how the container's top property is calculated.
 *
 *                                    +~~~~~~~~ stickyParent (where the container scrolls)
 * stickyOffset  ~~~~~~~~~~+          |
 * (e.g. masterbar)        |          |
 *                         v          v
 *                  +------#-----------------+
 *                  |      #        |<~~~~~~~+~~~~~ stickyPadding
 *                  | +----#--------------+  |
 *                  | |    #   @          |<~+~~~~~ stickyParent's content area
 *                  | |    #   @          |  |
 *                  | |    #   @ <~~~~~~~~+~~+~~~~~ the container's top
 *                  | |    #   @          |  |      (= stickyOffset - stickyPadding)
 *                  | |  =============    |  |
 *                  | |     ^             |  |
 *                  | |     |             |  |
 *                  | |     +~~~~~~~~~~~~~+~~+~~~~~ the container
 *                  | |                   |  |
 */
export function StickyContainer( props: Props ) {
	const {
		stickyOffset = 0,
		zIndex = 2,
		stickyClass = '',
		element = 'div',
		disabled = false,
		children,
	} = props;

	const stickyRef = useRef( null );
	const [ stickyParent, setStickyParent ] = useState< HTMLElement | null >( null );
	const [ stickyPadding, setStickyPadding ] = useState( 0 );
	const [ isStuck, setIsStuck ] = useState( false );

	/**
	 * Calculate the first scrollable parent and its padding-top.
	 */
	useEffect( () => {
		if ( ! stickyRef.current || typeof getComputedStyle === 'undefined' ) {
			return;
		}

		let scrollParent = stickyRef.current as HTMLElement | null;
		while ( scrollParent ) {
			const style = getComputedStyle( scrollParent );
			const overflowY = style.overflowY;
			if ( overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay' ) {
				break;
			}
			scrollParent = scrollParent.parentElement;
		}

		const receiveScrollParent = ( el: HTMLElement ) => {
			const styles = getComputedStyle( el );
			const paddingTop = parseFloat( styles.paddingTop );
			setStickyParent( scrollParent );
			setStickyPadding( paddingTop );
		};

		if ( scrollParent ) {
			scrollParent.style.position = 'relative';
			receiveScrollParent( scrollParent );

			if ( typeof ResizeObserver !== 'undefined' ) {
				const observer = new ResizeObserver(
					( [ parent ]: Parameters< ResizeObserverCallback >[ 0 ] ) => {
						receiveScrollParent( parent.target as HTMLElement );
					}
				);
				observer.observe( scrollParent );
				return () => {
					observer.disconnect();
				};
			}
		}
	}, [] );

	/**
	 * This effect sets the value of `isStuck` state when it detects that
	 * the element is sticky.
	 * The top property of the root margin is set at -1px (plus optional offset).
	 * So when position:sticky takes effect, the intersection ratio will always be ~99%
	 */
	useLayoutEffect( () => {
		if ( typeof IntersectionObserver === 'undefined' ) {
			return;
		}
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( disabled ) {
					return;
				}
				if ( entry.intersectionRatio === 0 ) {
					// The element is out of view
					setIsStuck( false );
				} else if (
					entry.rootBounds?.bottom !== undefined &&
					entry.boundingClientRect.bottom >= entry.rootBounds?.bottom
				) {
					// The element is intersecting, but it is at the bottom of the screen
					setIsStuck( false );
				} else {
					// The element is in the "stuck" state
					setIsStuck( entry.intersectionRatio < 1 );
				}
			},
			{
				root: stickyParent,
				rootMargin: `-${ stickyOffset + 1 }px 0px 0px 0px`,
				threshold: [ 0, 1 ],
			}
		);

		if ( stickyRef.current ) {
			observer.observe( stickyRef.current );
		}

		return () => {
			observer.disconnect();
		};
	}, [ disabled, stickyParent, stickyOffset, stickyPadding ] );

	const isStuckFinalState = ! disabled && isStuck;
	return (
		<>
			<Global
				styles={ css`
					/**
				 * .layout__content has overflow set to hidden, which prevents position: sticky from working.
				 * Instead of removing it globally, this CSS only unsets the property when this component is rendered.
				 */
					.layout__content {
						overflow: unset;
					}
				` }
			/>
			<Container
				{ ...props }
				as={ element }
				ref={ stickyRef }
				stickyOffset={ stickyOffset }
				stickyPadding={ stickyPadding }
				disabled={ disabled }
				className={ clsx( { [ stickyClass ]: isStuckFinalState } ) }
				zIndex={ zIndex }
			>
				{ children( isStuckFinalState ) }
			</Container>
		</>
	);
}
