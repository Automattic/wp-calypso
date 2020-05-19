/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

export default function ErrorMessage( { children } ) {
	return <Error>{ children }</Error>;
}

const Error = styled.div`
	display: block;
	padding: 24px 16px;
	border-left: 3px solid ${( props ) => props.theme.colors.error};
	background: ${( props ) => props.theme.colors.warningBackground};
	box-sizing: border-box;
	line-height: 1.2em;
`;
