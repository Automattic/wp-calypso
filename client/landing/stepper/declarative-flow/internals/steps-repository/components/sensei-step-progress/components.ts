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
	max-width: 560px;
	width: 100%;
	margin: auto 24px;
	padding: 32px 20px 60px;
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
	right: 20px;
	bottom: 32px;
	left: 20px;
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
	margin-left: max( calc( 100vw - 237px ), 22rem );
	flex: 0 1 auto;
	position: relative;

	@media ( min-width: 700px ) {
		max-width: 395px;
		margin-left: auto;
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
