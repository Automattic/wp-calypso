import styled from '@emotion/styled';
import type { HTMLAttributes, PropsWithChildren } from 'react';

const Error = styled.div< HTMLAttributes< HTMLDivElement > >`
	display: block;
	padding: 24px 16px;
	border-left: 3px solid ${ ( props ) => props.theme.colors.error };
	background: ${ ( props ) => props.theme.colors.warningBackground };
	box-sizing: border-box;
	line-height: 1.2em;

	.rtl & {
		border-right: 3px solid ${ ( props ) => props.theme.colors.error };
		border-left: 0 none;
	}
`;

// eslint-disable-next-line @typescript-eslint/ban-types
export default function ErrorMessage( { children }: PropsWithChildren< {} > ) {
	return <Error>{ children }</Error>;
}
