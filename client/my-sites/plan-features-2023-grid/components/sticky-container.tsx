import { Global, css } from '@emotion/react';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import styled from '@emotion/styled';
import { useRef, type ElementType, useState, useLayoutEffect } from 'react';

type Props = {
	children: ( isStuck: boolean ) => EmotionJSX.Element[];
	stickyClass: string;
	element?: ElementType;
	blockOffset?: number;
};

const Container = styled.div< { blockOffset: number } >`
	position: sticky;
	inset-block-start: ${ ( props ) => props.blockOffset + 'px' };
	z-index: 1;
`;

export function StickyContainer( props: Props ) {
	const stickyRef = useRef( null );

	const [ isStuck, setIsStuck ] = useState( false );
	const [ masterbarHeight, setMasterbarHeight ] = useState( 0 );

	// Measure height of masterbar as we need it for the THead styles
	useLayoutEffect( () => {
		const masterbarElement = document.querySelector< HTMLDivElement >( 'header.masterbar' );

		if ( ! masterbarElement ) {
			return;
		}

		if ( ! window.ResizeObserver ) {
			setMasterbarHeight( masterbarElement.offsetHeight );
			return;
		}

		let lastHeight = masterbarElement.offsetHeight;

		const observer = new ResizeObserver(
			( [ masterbar ]: Parameters< ResizeObserverCallback >[ 0 ] ) => {
				const currentHeight = masterbar.contentRect.height;

				if ( currentHeight !== lastHeight ) {
					setMasterbarHeight( currentHeight );
					lastHeight = currentHeight;
				}
			}
		);

		observer.observe( masterbarElement );

		return () => {
			observer.disconnect();
		};
	}, [] );

	// This effect adds the `stickyClass` to the element when the element is "stuck"
	useLayoutEffect( () => {
		const observer = new IntersectionObserver(
			( [ e ] ) => {
				e.target.classList.toggle( props.stickyClass, e.intersectionRatio < 1 );
				setIsStuck( e.intersectionRatio < 1 );
			},
			{
				rootMargin: `-${ masterbarHeight + 1 }px 0px 0px 0px`,
				threshold: [ 1 ],
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
	}, [ masterbarHeight, props.stickyClass ] );

	return (
		<>
			<Global
				styles={ css`
					.layout__content {
						overflow: unset;
					}
				` }
			/>
			<Container
				{ ...props }
				as={ props.element ?? 'div' }
				ref={ stickyRef }
				blockOffset={ masterbarHeight }
			>
				{ props.children( isStuck ) }
			</Container>
		</>
	);
}
