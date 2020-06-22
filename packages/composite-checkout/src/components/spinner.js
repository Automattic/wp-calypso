/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import { useI18n } from '@automattic/react-i18n';

export default function Spinner( { className } ) {
	const { isRTL } = useI18n();
	return <SpinnerWrapper className={ className } isRTL={ isRTL } />;
}

const rotate = keyframes`
	100% {
		transform: rotate( 360deg );
	}
`;

const SpinnerWrapper = styled.div`
	display: block;
	width: 20px;
	height: 20px;
	border: 3px solid transparent;
	border-top-color: ${ ( props ) => props.theme.colors.highlight };
	border-radius: 100%;
	box-sizing: border-box;
	position: relative;
	animation: ${ rotate } 3s linear infinite;
	animation-fill-mode: backwards;

	:after {
		position: absolute;
		top: 0;
		${ ( props ) => ( props.isRTL ? 'right: -1px;' : 'left: -1px;' ) }
		width: 17px;
		height: 17px;
		border: 3px solid transparent;
		border-top-color: ${ ( props ) => props.theme.colors.highlight };
		border-right-color: ${ ( props ) => props.theme.colors.highlight };
		box-sizing: border-box;
		opacity: 0.5;
		content: '';
		border-radius: 100%;
		animation: ${ rotate } 3s linear infinite;
		animation-fill-mode: backwards;
	}
`;
