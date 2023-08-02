import styled from '@emotion/styled';

/**
 * Simple placeholder that renders as a pulsing line.
 */
export const LoadingPlaceHolder = styled.div`
	margin: 0;
	background: var( --color-neutral-10 );
	border-radius: 20px;
	content: '';
	display: block;
	height: 8px;
	animation: pulse-light 0.8s ease-in-out infinite;
`;
