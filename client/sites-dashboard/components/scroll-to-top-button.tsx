import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';

type ScrollButtonProps = {
	classname?: string;
};

const ScrollButton = styled.button< { visible: boolean } >`
	position: fixed;
	display: flex;
	opacity: ${ ( props ) => ( props.visible ? 1 : 0 ) };
	align-items: center;
	justify-content: center;
	bottom: 40px;
	left: 40px;
	z-index: 1;
	height: 42px;
	width: 42px;
	background-color: #000;
	color: #fff;
	border-radius: 4px;
	transition: opacity 0.3s ease-in-out;
`;

export const ScrollToTopButton = ( { classname }: ScrollButtonProps ) => {
	const SCROLL_THRESHOLD = 400;
	const [ visible, setVisible ] = useState( false );

	const scrollCallback = useCallback( () => {
		if ( window.scrollY > SCROLL_THRESHOLD ) {
			setVisible( true );
		} else {
			setVisible( false );
		}
	}, [] );

	useEffect( () => {
		window.addEventListener( 'scroll', scrollCallback );

		return () => {
			window.removeEventListener( 'scroll', scrollCallback );
		};
	}, [ scrollCallback, classname ] );

	const scrollToTop = () => {
		window.scrollTo( {
			top: 0,
			behavior: 'smooth',
		} );
	};
	return (
		<ScrollButton className={ classname } onClick={ scrollToTop } visible={ visible }>
			<Gridicon icon={ 'arrow-up' } size={ 18 } />
		</ScrollButton>
	);
};
