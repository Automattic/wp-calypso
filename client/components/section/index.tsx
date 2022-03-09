import styled from '@emotion/styled';
import { ReactChild } from 'react';

interface SectionProps {
	header: ReactChild;
	children: ReactChild | ReactChild[];
}

const SectionContainer = styled.div`
	::before {
		box-sizing: border-box;
		content: '';
		background-color: #fafafa;
		position: absolute;
		height: 100%;
		width: 200vw;
		left: -100vw;
		z-index: -1;
		margin-top: -60px;
	}
	margin-top: 100px;

	padding-top: 60px;
	padding-bottom: 96px;
`;

const SectionHeader = styled.div`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	font-family: Recoleta, 'Noto Serif', Georgia, 'Times New Roman', Times, serif;
	font-weight: 400;
	letter-spacing: -0.4px;
	text-align: left;
	margin-bottom: 25px;
	font-size: 2rem;
	max-width: 377px;
	line-height: 40px;
`;

const SectionContent = styled.div``;

const Section = ( props: SectionProps ) => {
	const { children, header } = props;

	return (
		<SectionContainer>
			<SectionHeader>{ header }</SectionHeader>
			<SectionContent>{ children }</SectionContent>
		</SectionContainer>
	);
};

export default Section;
