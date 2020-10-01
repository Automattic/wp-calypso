/**
 * External dependencies
 */
import React from 'react';
import { keyframes } from '@emotion/core';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';

export default function LoadingContent() {
	const { __ } = useI18n();

	return (
		<LoadingContentWrapperUi>
			<LoadingContentUi>
				<LoadingCard>
					<LoadingTitle>{ __( 'Loading checkout' ) }</LoadingTitle>
					<LoadingCopy />
					<LoadingCopy />
				</LoadingCard>
				<LoadingCard>
					<LoadingTitle />
					<LoadingCopy />
					<LoadingCopy />
				</LoadingCard>
				<LoadingCard>
					<LoadingTitle />
				</LoadingCard>
				<LoadingCard>
					<LoadingTitle />
				</LoadingCard>
				<LoadingFooter />
			</LoadingContentUi>

			<LoadingSideBarUi>
				<LoadingCopy />
				<LoadingCopy />
				<LoadingCopy />
			</LoadingSideBarUi>
		</LoadingContentWrapperUi>
	);
}

const LoadingContentWrapperUi = styled.div`
	display: flex;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		align-items: flex-start;
		flex-direction: row;
		justify-content: center;
		width: 100%;
	}
`;

const LoadingContentUi = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		max-width: 556px;
	}
`;

const LoadingSideBarUi = styled.div`
	display: none;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		display: block;
		padding: 24px;
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		max-width: 326px;
		background: ${ ( props ) => props.theme.colors.surface };
		margin-left: 24px;
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
	margin: 3px 0 0 35px;
	padding: 0;
	position: relative;
	animation: ${ pulse } 2s ease-in-out infinite;
	height: 20px;

	.rtl & {
		margin: 3px 35px 0 0;
	}

	::before {
		content: '';
		display: block;
		position: absolute;
		left: -35px;
		top: -3px;
		width: 27px;
		height: 27px;
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 100%;

		.rtl & {
			right: -35px;
			left: auto;
		}
	}
`;
const LoadingCopy = styled.p`
	font-size: 14px;
	height: 16px;
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 8px 0 0 35px;
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;

	.rtl & {
		margin: 8px 35px 0 0;
	}
`;

const LoadingFooter = styled.div`
	background: ${ ( props ) => props.theme.colors.background };
	content: '';
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 24px;

	::before {
		content: '';
		display: block;
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 3px;
		font-size: 14px;
		width: 100%;
		height: 40px;
	}
`;
