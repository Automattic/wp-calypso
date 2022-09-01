import styled from '@emotion/styled';
import site1 from 'calypso/assets/images/difm/site1.jpg';
import site2 from 'calypso/assets/images/difm/site2.jpg';
import site3 from 'calypso/assets/images/difm/site3.jpg';
import site4 from 'calypso/assets/images/difm/site4.jpg';
import site5 from 'calypso/assets/images/difm/site5.jpg';

const Container = styled.div`
	height: 100%;
	width: 100%;
	position: relative;

	@keyframes fadeAnimation {
		6% {
			opacity: 1;
		}
		20% {
			opacity: 1;
		}
		26% {
			opacity: 0;
		}
	}

	> div {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		animation: fadeAnimation 40s infinite;
		background-size: contain;
		background-repeat: no-repeat;
		opacity: 0;
	}

	> div:nth-of-type( 2 ) {
		animation-delay: 8s;
	}
	> div:nth-of-type( 3 ) {
		animation-delay: 16s;
	}
	> div:nth-of-type( 4 ) {
		animation-delay: 24s;
	}
	> div:nth-of-type( 5 ) {
		animation-delay: 32s;
	}
`;

export default function SiteBuildShowcase() {
	return (
		<Container>
			<div style={ { backgroundImage: `url( ${ site1 } )` } } />
			<div style={ { backgroundImage: `url( ${ site2 } )` } } />
			<div style={ { backgroundImage: `url( ${ site3 } )` } } />
			<div style={ { backgroundImage: `url( ${ site4 } )` } } />
			<div style={ { backgroundImage: `url( ${ site5 } )` } } />
		</Container>
	);
}
