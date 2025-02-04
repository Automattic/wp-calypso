import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface LoadingPlaceholderProps {
	delayMS?: number;
	display?: 'block' | 'inline-block';
	width?: string | number;
	height?: string | number;
	minHeight?: string | number;
	borderRadius?: string;
}

const pulseLightKeyframes = keyframes`
	50% {
		background-color: var( --color-neutral-0 );
	}`;

const LoadingPlaceholder = styled.div< LoadingPlaceholderProps >`
	animation: ${ pulseLightKeyframes } 1.8s ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	min-height: ${ ( { minHeight = '18px' } ) => minHeight };
	${ ( { height } ) => height && `height: ${ height }` };
	width: ${ ( { width = '100%' } ) => width };
	border-radius: ${ ( { borderRadius = '0' } ) => borderRadius };
	animation-delay: ${ ( { delayMS = 0 } ) => delayMS }ms;
	display: ${ ( { display = 'block' } ) => display };
`;

export default LoadingPlaceholder;
