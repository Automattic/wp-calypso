import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useRef, type ElementType, useState, useLayoutEffect, ReactNode } from 'react';

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
	zIndex,
}: {
	disabled: boolean;
	stickyOffset: number;
	zIndex: number;
} ) =>
	disabled
		? ''
		: css`
				position: sticky;
				top: ${ stickyOffset + 'px' };
				z-index: ${ zIndex };
		  `;

const Container = styled.div`
	${ styles }
`;

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
	const [ isStuck, setIsStuck ] = useState( false );

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
	}, [ disabled, stickyOffset ] );

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
				disabled={ disabled }
				className={ clsx( { [ stickyClass ]: isStuckFinalState } ) }
				zIndex={ zIndex }
			>
				{ children( isStuckFinalState ) }
			</Container>
		</>
	);
}
