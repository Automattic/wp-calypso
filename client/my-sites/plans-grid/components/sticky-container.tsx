import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, type ElementType, useState, useLayoutEffect, ReactNode } from 'react';

type Props = {
	children: ( isStuck: boolean ) => ReactNode;
	stickyClass?: string; // class to apply when the element is "stuck"
	element?: ElementType; // which element to render, defaults to div
	stickyOffset?: number; // offset from the top of the scrolling container to control when the element should start sticking, default 0
	disabled?: boolean; // force disabled sticky behaviour if set to true
};

const styles = ( { disabled, stickyOffset }: { disabled: boolean; stickyOffset: number } ) =>
	disabled
		? ''
		: css`
				position: sticky;
				top: ${ stickyOffset + 'px' };
				z-index: 1;
		  `;

const Container = styled.div`
	${ styles }
`;

export function StickyContainer( props: Props ) {
	const { stickyOffset = 0, stickyClass = '', element = 'div', disabled = false, children } = props;

	const stickyRef = useRef( null );
	const [ isStuck, setIsStuck ] = useState( false );

	/**
	 * This effect sets the value of `isStuck` state when it detects that
	 * the element is sticky.
	 * The top property of the root margin is set at -1px (plus optional offset).
	 * So when position:sticky takes effect, the intersection ratio will always be ~99%
	 */
	useLayoutEffect( () => {
		if ( ! IntersectionObserver ) {
			return;
		}
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( entry.intersectionRatio === 0 ) {
					// The element is out of view
					setIsStuck( false );
				} else if ( entry.intersectionRect.bottom === entry.rootBounds?.bottom ) {
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
	}, [ stickyOffset ] );

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
						min-height: unset;
					}
				` }
			/>
			<Container
				{ ...props }
				as={ element }
				ref={ stickyRef }
				stickyOffset={ stickyOffset }
				disabled={ disabled }
				className={ isStuck ? stickyClass : '' }
			>
				{ children( isStuck ) }
			</Container>
		</>
	);
}
