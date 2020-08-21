/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';

export default function ErrorMessage( { children }: { children?: React.ReactNode } ) {
	return <Error>{ children }</Error>;
}

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
