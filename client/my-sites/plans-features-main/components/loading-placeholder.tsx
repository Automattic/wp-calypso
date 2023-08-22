import styled from '@emotion/styled';

/**
 * Simple placeholder that renders as a pulsing line.
 */
export const LoadingPlaceHolder = styled.div< {
	display: 'block' | 'inline-block';
	width: string;
	height: string;
	borderRadius: string;
} >`
	margin: 0;
	background: var( --color-neutral-10 );
	border-radius: ${ ( { borderRadius } ) => borderRadius ?? '20px' };
	content: '';
	display: ${ ( { display } ) => display ?? 'block' };
	width: ${ ( { width } ) => width ?? '100%' };
	height: ${ ( { height } ) => height ?? '8px' };
	animation: pulse-light 0.8s ease-in-out infinite;
`;
