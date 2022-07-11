import styled from '@emotion/styled';
import site1 from 'calypso/assets/images/difm/site1.jpg';
import site2 from 'calypso/assets/images/difm/site2.jpg';
import site3 from 'calypso/assets/images/difm/site3.jpg';
import site4 from 'calypso/assets/images/difm/site4.jpg';

const Container = styled.div`
	height: 100%;
	width: 100%;
	position: relative;

	@keyframes fadeAnimation {
		10% {
			opacity: 1;
		}
		20% {
			opacity: 1;
		}
		30% {
			opacity: 0;
		}
	}

	> div {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		animation: fadeAnimation 20s infinite;
		background-size: contain;
		background-repeat: no-repeat;
		opacity: 0;
	}

	> div:nth-child( 2 ) {
		animation-delay: 5s;
	}
	> div:nth-child( 3 ) {
		animation-delay: 10s;
	}
	> div:nth-child( 4 ) {
		animation-delay: 15s;
	}
`;

export default function SiteBuildShowcase() {
	return (
		<Container>
			<div style={ { backgroundImage: `url( ${ site1 } )` } } />
			<div style={ { backgroundImage: `url( ${ site2 } )` } } />
			<div style={ { backgroundImage: `url( ${ site3 } )` } } />
			<div style={ { backgroundImage: `url( ${ site4 } )` } } />
		</Container>
	);
}
