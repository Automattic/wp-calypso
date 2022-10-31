import { keyframes } from '@emotion/css';
import styled from '@emotion/styled';

const ellipsisProgress = keyframes`
    0% {
        content: '';
    }
    33% {
        content: '.';
    }
    66% {
        content: '..';
    }
    100% {
        content: '...';
    }
`;

export const ProgressingTitle = styled.h1`
	position: relative;
	font-family: 'Recoleta';
	&::after {
		display: inline-block;
		position: absolute;
		left: 100%;
		content: '';
		animation: ${ ellipsisProgress } 2s ease infinite;
	}
`;
