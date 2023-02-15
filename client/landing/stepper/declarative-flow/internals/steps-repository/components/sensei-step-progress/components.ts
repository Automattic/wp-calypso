import styled from '@emotion/styled';

export const Container = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #b7c9be;
	overflow: hidden;
`;

export const Content = styled.div`
	max-width: 520px;
	width: 100%;
	margin: auto 24px;
	padding: 32px 0 60px;
	flex: 0 0 auto;
	position: relative;
`;

export const Title = styled.div`
	font-family: Recoleta, sans-serif;
	font-size: 32px;
	line-height: 40px;
	position: relative;
	width: 100%;
	text-align: center;
`;

export const Subtitle = styled.div`
	text-align: center;
	margin: 12px auto;
`;

export const Progress = styled.div`
	position: absolute;
	right: 0;
	bottom: 32px;
	left: 0;
	height: 4px;
	background-color: #fff;
`;

export const ProgressValue = styled.div< { progress: number } >`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: #217d7c;
	width: ${ ( props ) => props.progress }%;
	transition: width 800ms ease-out;
`;

export const TopRightImg = styled.img`
	width: 100%;
	max-width: 237px;
	margin-left: auto;
	flex: 0 1 auto;

	@media ( min-width: 700px ) {
		max-width: 395px;
	}
`;

export const BottomLeftImg = styled.img`
	width: 100%;
	max-width: 225px;
	margin-right: auto;
	flex: 0 1 auto;

	@media ( min-width: 700px ) {
		max-width: 376px;
	}
`;
