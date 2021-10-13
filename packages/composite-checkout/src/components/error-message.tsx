import styled from '@emotion/styled';
import * as React from 'react';

const Error = styled.div< React.HTMLAttributes< HTMLDivElement > >`
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

export default function ErrorMessage( { children }: { children?: React.ReactNode } ): JSX.Element {
	return <Error>{ children }</Error>;
}
