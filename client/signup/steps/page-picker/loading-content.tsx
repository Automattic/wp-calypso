import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const LoadingCard = styled.div`
	padding: 24px 0;
	border-bottom: 1px solid var( --studio-gray-5 );
	margin-top: 10px;
	@media ( max-width: 600px ) {
		padding: 8px 13px;
		margin: 5px 3px;
		border: none;
	}
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }

  70% {
  	opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
`;

const LoadingTitle = styled.h1`
	font-size: 14px;
	content: '';
	font-weight: 400;
	background: var( --studio-gray-5 );
	color: var( --studio-gray-5 );
	width: 40%;
	margin: 3px 0 0 35px;
	padding: 0;
	position: relative;
	animation: ${ pulse } 2s ease-in-out infinite;
	height: 20px;

	@media ( max-width: 600px ) {
		height: 10px;
		width: 40%;
	}

	::before {
		content: '';
		display: block;
		position: absolute;
		left: -35px;
		top: -3px;
		width: 27px;
		height: 27px;
		background: var( --studio-gray-5 );
		border-radius: 100%;
		@media ( max-width: 600px ) {
			width: 12px;
			height: 12px;
		}
	}
`;
export default function LoadingLine() {
	return (
		<LoadingCard>
			<LoadingTitle />
		</LoadingCard>
	);
}
