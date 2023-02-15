import styled from '@emotion/styled';

export const Container = styled.div`
	position: relative;
	height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	overflow-y: auto;
	box-sizing: border-box;

	* {
		box-sizing: border-box;
	}
`;

export const TitleContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 32px auto 0 24px;
	z-index: 1000;
`;

export const Title = styled.h1`
	margin-left: 8px;
	font-size: 18px;
	line-height: 24px;
	font-family: Recoleta, sans-serif;
`;

export const Footer = styled.div`
	margin-top: auto;
	padding: 56px 0;
`;

export const FooterText = styled.p`
	font-size: 13px;
	line-height: 20px;
	color: #3c434a;
	text-align: center;
	&:not( :last-of-type ) {
		margin-bottom: 6px;
	}
`;
