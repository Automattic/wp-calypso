import styled from '@emotion/styled';
import { ReactChild } from 'react';

interface FooterSectionProps {
	header: ReactChild;
	children: ReactChild | ReactChild[];
}

const FooterContainer = styled.div`
	::before {
		box-sizing: border-box;
		content: '';
		background-color: ${ ( props ) => ( props.dark ? '#1A1E22' : '#fafafa' ) };
		position: absolute;
		height: 100%;
		width: 200vw;
		left: -100vw;
		z-index: -1;
		margin-top: -60px;
	}
	margin-top: 100px;

	padding-top: 60px;
	padding-bottom: 60px;
`;

const FooterHeader = styled.div`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	font-family: Recoleta, 'Noto Serif', Georgia, 'Times New Roman', Times, serif;
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	letter-spacing: -0.4px;
	text-align: left;
	margin-bottom: 25px;
	font-size: 2rem;
	max-width: 377px;
	line-height: 40px;
`;

const FooterContent = styled.div``;

const FooterSection = ( props: FooterSectionProps ) => {
	const { children, header, dark } = props;

	return (
		<FooterContainer dark={ dark }>
			<FooterHeader dark={ dark }>{ header }</FooterHeader>
			<FooterContent>{ children }</FooterContent>
		</FooterContainer>
	);
};

export default FooterSection;
