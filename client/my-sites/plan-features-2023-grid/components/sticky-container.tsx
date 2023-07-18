import { Global, css } from '@emotion/react';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import styled from '@emotion/styled';
import { useRef, type ElementType, useState, useLayoutEffect } from 'react';

type Props = {
	children: ( isStuck: boolean ) => EmotionJSX.Element[];
	stickyClass: string;
	element?: ElementType;
	blockOffset: number;
};

const Container = styled.div< { blockOffset: number } >`
	position: sticky;
	top: ${ ( props ) => props.blockOffset + 'px' };
	z-index: 1;
`;

export function StickyContainer( props: Props ) {
	const stickyRef = useRef( null );
	const [ isStuck, setIsStuck ] = useState( false );

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
				rootMargin: `-${ props.blockOffset + 1 }px 0px 0px 0px`,
				threshold: [ 0, 1 ],
			}
		);

		const ref = stickyRef.current;

		if ( ref ) {
			observer.observe( ref );
		}
		return () => {
			if ( ref ) {
				observer.unobserve( ref );
			}
		};
	}, [ props.blockOffset, props.stickyClass ] );

	return (
		<>
			<Global
				styles={ css`
					/**
				 * .layout__content has overflow set to hidden, which prevents position: sticky from working.
				 * Instead of removing it globally, this CSS only unsets the property when the StickyContainer is rendered.
				 */
					.layout__content {
						overflow: unset;
					}
				` }
			/>
			<Container
				{ ...props }
				as={ props.element ?? 'div' }
				ref={ stickyRef }
				blockOffset={ props.blockOffset }
				className={ isStuck ? props.stickyClass : '' }
			>
				{ props.children( isStuck ) }
			</Container>
		</>
	);
}
