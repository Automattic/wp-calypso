/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useI18n } from '@automattic/react-i18n';

export default function ErrorMessage( { children } ) {
	const { isRTL } = useI18n();
	return <Error isRTL={ isRTL }>{ children }</Error>;
}

const Error = styled.div`
	display: block;
	padding: 24px 16px;
	${ ( props ) =>
		props.isRTL
			? `border-right: 3px solid ${ props.theme.colors.error };`
			: `border-left: 3px solid ${ props.theme.colors.error };` }
	background: ${ ( props ) => props.theme.colors.warningBackground };
	box-sizing: border-box;
	line-height: 1.2em;
`;
