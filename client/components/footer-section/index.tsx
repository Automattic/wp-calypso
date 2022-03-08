import styled from '@emotion/styled';

const FooterContainer = styled.div`
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

const FooterHeader = styled.div`
	font-family: Recoleta, 'Noto Serif', Georgia, 'Times New Roman', Times, serif;
	font-weight: 400;
	letter-spacing: -0.4px;
	text-align: left;
	margin-bottom: 25px;
	font-size: 2rem;
	max-width: 377px;
	line-height: 40px;
`;

const FooterContent = styled.div``;

const FooterSection = ( props ) => {
	const { children, header } = props;

	return (
		<FooterContainer>
			<FooterHeader>{ header }</FooterHeader>
			<FooterContent>{ children }</FooterContent>
		</FooterContainer>
	);
};

export default FooterSection;
