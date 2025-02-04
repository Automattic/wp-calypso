import styled from '@emotion/styled';

const LoaderText = styled.span`
	display: flex;
	align-items: center;
	font-size: 16px;
	font-weight: 400;
	line-height: 24px;
	position: relative;

	&:before {
		content: '';
		display: inline-block;
		border-radius: 50%;
		margin-right: 10px;
		content: '';
		width: 16px;
		height: 16px;
		border: solid 2px #074ee8;
		border-radius: 50%;
		border-bottom-color: transparent;
		-webkit-transition: all 0.5s ease-in;
		-webkit-animation-name: rotate;
		-webkit-animation-duration: 1s;
		-webkit-animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;

		transition: all 0.5s ease-in;
		animation-name: rotate;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	@keyframes rotate {
		from {
			transform: rotate( 0deg );
		}
		to {
			transform: rotate( 360deg );
		}
	}

	@-webkit-keyframes rotate {
		from {
			-webkit-transform: rotate( 0deg );
		}
		to {
			-webkit-transform: rotate( 360deg );
		}
	}
`;

export default LoaderText;
