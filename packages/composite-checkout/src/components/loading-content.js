/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import { useI18n } from '@automattic/react-i18n';

export default function LoadingContent() {
	const { __, isRTL } = useI18n();

	return (
		<LoadingContentWrapperUI>
			<LoadingCard>
				<LoadingTitle isRTL={ isRTL }>{ __( 'Loading checkout' ) }</LoadingTitle>
				<LoadingCopy isRTL={ isRTL } />
				<LoadingCopy isRTL={ isRTL } />
			</LoadingCard>
			<LoadingCard>
				<LoadingTitle isRTL={ isRTL } />
				<LoadingCopy isRTL={ isRTL } />
				<LoadingCopy isRTL={ isRTL } />
			</LoadingCard>
			<LoadingCard>
				<LoadingTitle isRTL={ isRTL } />
			</LoadingCard>
			<LoadingCard>
				<LoadingTitle isRTL={ isRTL } />
			</LoadingCard>
			<LoadingFooter />
		</LoadingContentWrapperUI>
	);
}

const LoadingContentWrapperUI = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	width: 100%;
	box-sizing: border-box;
	margin-bottom: ${ ( props ) => ( props.isLastStepActive ? '100px' : 0 ) };

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		margin: 32px auto;
		box-sizing: border-box;
		max-width: 556px;
	}
`;

const LoadingCard = styled.div`
	padding: 24px;
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };

	:first-of-type {
		border-top: 0;
	}
`;

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

const LoadingTitle = styled.h1`
	font-size: 14px;
	content: '';
	font-weight: ${ ( props ) => props.theme.weights.normal };
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	width: 40%;
	margin: ${ ( props ) => ( props.isRTL ? '3px 35px 0 0' : '3px 0 0 35px' ) };
	padding: 0;
	position: relative;
	animation: ${ pulse } 2s ease-in-out infinite;
	height: 20px;

	:before {
		content: '';
		display: block;
		position: absolute;
		${ ( props ) => ( props.isRTL ? 'right: -35px;' : 'left: -35px;' ) }
		top: -3px;
		width: 27px;
		height: 27px;
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 100%;
	}
`;
const LoadingCopy = styled.p`
	font-size: 14px;
	height: 16px;
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: ${ ( props ) => ( props.isRTL ? '8px 35px 0 0' : '8px 0 0 35px' ) };
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
`;

const LoadingFooter = styled.div`
	background: ${ ( props ) => props.theme.colors.background };
	content: '';
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 24px;

	:before {
		content: '';
		display: block;
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 3px;
		font-size: 14px;
		width: 100%;
		height: 40px;
	}
`;
