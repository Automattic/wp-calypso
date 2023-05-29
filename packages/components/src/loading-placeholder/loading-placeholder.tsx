import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface LoadingPlaceholderProps {
	delayMS?: number | null;
}

const pulseLightKeyframes = keyframes`
	50% {
		background-color: var( --color-neutral-0 );
	}`;

const LoadingPlaceholder = styled.div< LoadingPlaceholderProps >`
	background-color: var( --color-neutral-10 );
	min-height: 18px;
	width: 100%;
	${ ( props ) =>
		props.delayMS !== null && {
			animation: `${ pulseLightKeyframes } 1.8s ease-in-out infinite`,
			animationDelay: `${ props.delayMS ?? 0 }ms`,
		} }
`;

export default LoadingPlaceholder;
