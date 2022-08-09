import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface LoadingPlaceholderProps {
	delayMS?: number;
}

const pulseLightKeyframes = keyframes`
	50% {
		background-color: var( --color-neutral-0 );
	}`;

const LoadingPlaceholder = styled.div< LoadingPlaceholderProps >`
	animation: ${ pulseLightKeyframes } 1.8s ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	min-height: 18px;
	width: 100%;
	animation-delay: ${ ( { delayMS = 0 } ) => delayMS }ms;
`;

export default LoadingPlaceholder;
