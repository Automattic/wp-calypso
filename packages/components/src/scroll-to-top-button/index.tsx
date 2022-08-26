import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import Gridicon from '../gridicon';

type ScrollButtonProps = {
	classname?: string;
	children?: React.ReactNode;
	scrollThreshold?: number;
};

const ScrollButton = styled.button< { visible: boolean } >`
	position: fixed;
	display: flex;
	opacity: ${ ( props ) => ( props.visible ? 1 : 0 ) };
	align-items: center;
	justify-content: center;
	inset-block-end: 24px;
	inset-inline-start: 24px;
	z-index: 176;
	height: 42px;
	width: 42px;
	background-color: #000;
	color: #fff;
	border-radius: 4px;
	transition: opacity 0.3s ease-in-out;
`;

export const ScrollToTopButton = ( {
	classname,
	children,
	scrollThreshold = window.innerHeight,
}: ScrollButtonProps ) => {
	const [ visible, setVisible ] = useState( false );

	const scrollCallback = useCallback( () => {
		if ( window.scrollY > scrollThreshold ) {
			setVisible( true );
		} else {
			setVisible( false );
		}
	}, [ scrollThreshold ] );

	useEffect( () => {
		window.addEventListener( 'scroll', scrollCallback );

		return () => {
			window.removeEventListener( 'scroll', scrollCallback );
		};
	}, [ scrollCallback, classname, children ] );

	const scrollToTop = () => {
		window.scrollTo( {
			top: 0,
			behavior: 'smooth',
		} );
	};
	return (
		<ScrollButton
			className={ classname }
			onClick={ scrollToTop }
			visible={ visible }
			title={ __( 'Scroll to top' ) }
			aria-label={ __( 'Scroll to top' ) }
		>
			{ children || <Gridicon icon={ 'arrow-up' } size={ 18 } /> }
		</ScrollButton>
	);
};
