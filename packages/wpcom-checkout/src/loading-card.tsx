import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

export const LoadingCard = styled.div`
	padding: 24px 0;

	:first-of-type {
		border-top: 0;
	}
`;

export const LoadingRow = styled.div`
	display: flex;
	justify-content: space-between;
`;

interface LoadingContainerProps {
	noMargin?: boolean;
	width?: string;
	height?: string;
}

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

export const LoadingCopy = styled.p< LoadingContainerProps >`
	font-size: 14px;
	height: ${ ( props ) => props.height ?? '16px' };
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: ${ ( props ) => ( props.noMargin ? '0' : '8px 0 0 0' ) };
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
	width: ${ ( props ) => props.width ?? 'inherit' };
	box-sizing: border-box;

	.rtl & {
		margin: 8px 0 0 0;
	}
`;
