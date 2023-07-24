import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, type ElementType, useState, useLayoutEffect, ReactNode } from 'react';

type Props = {
	children: ( isStuck: boolean ) => ReactNode;
	stickyClass?: string;
	element?: ElementType;
	stickyOffset?: number; // offset from the top of the scrolling container to control when the element should start sticking, default 0
	topOffset?: number; // offset from the top of the scrolling container to control the position of the sticky element, default 0
};

const Container = styled.div< { topOffset: number } >`
	position: sticky;
	top: ${ ( props ) => props.topOffset + 'px' };
	z-index: 1;
`;

export function StickyContainer( props: Props ) {
	const { stickyOffset = 0, topOffset = 0, stickyClass = '', element = 'div', children } = props;

	const stickyRef = useRef( null );
	const [ isStuck, setIsStuck ] = useState( false );

	/**
	 * This effect sets the value of `isStuck` state when it detects that
	 * the element is sticky.
	 */
	useLayoutEffect( () => {
		const observer = new IntersectionObserver(
			( [ e ] ) => {
				if ( e.intersectionRatio === 0 ) {
					setIsStuck( false );
				} else {
					setIsStuck( e.intersectionRatio < 1 );
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
					}
				` }
			/>
			<Container
				{ ...props }
				as={ element }
				ref={ stickyRef }
				topOffset={ topOffset }
				className={ isStuck ? stickyClass : '' }
			>
				{ children( isStuck ) }
			</Container>
		</>
	);
}
