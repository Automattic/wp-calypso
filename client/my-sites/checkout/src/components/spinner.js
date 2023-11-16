import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const rotate = keyframes`
	100% {
		transform: rotate( 360deg );
	}
`;

const SpinnerWrapper = styled.div`
	display: block;
	width: 20px;
	height: 20px;
	border: 3px solid transparent;
	border-top-color: ${ ( props ) => props.theme.colors.highlight };
	border-radius: 100%;
	box-sizing: border-box;
	position: relative;
	animation: ${ rotate } 3s linear infinite;
	animation-fill-mode: backwards;

	::after {
		position: absolute;
		top: 0;
		left: -1px;
		width: 17px;
		height: 17px;
		border: 3px solid transparent;
		border-top-color: ${ ( props ) => props.theme.colors.highlight };
		border-right-color: ${ ( props ) => props.theme.colors.highlight };
		box-sizing: border-box;
		opacity: 0.5;
		content: '';
		border-radius: 100%;
		animation: ${ rotate } 3s linear infinite;
		animation-fill-mode: backwards;

		.rtl & {
			border-right-color: transparent;
			border-left-color: ${ ( props ) => props.theme.colors.highlight };
			right: -1px;
			left: auto;
		}
	}
`;

export default function Spinner( { className = undefined } ) {
	return <SpinnerWrapper className={ className } />;
}
