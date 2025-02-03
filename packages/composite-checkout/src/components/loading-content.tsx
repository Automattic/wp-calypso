import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';

const LoadingContentWrapper = styled.div`
	display: flex;
	padding: 25px 24px 0;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 25px 0 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		align-items: flex-start;
		flex-direction: row;
		justify-content: center;
		width: 100%;
	}
`;

const LoadingContentInnerWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		margin: 0 auto;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
	}
`;

const LoadingCard = styled.div`
	padding: 24px 0;

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

interface LoadingContainerProps {
	width?: string;
	height?: string;
}

const LoadingTitle = styled.h1< LoadingContainerProps >`
	font-size: 14px;
	content: '';
	font-weight: ${ ( props ) => props.theme.weights.normal };
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	width: ${ ( props ) => props.width ?? '40%' };
	margin: 3px 0 0 40px;
	padding: 0;
	position: relative;
	animation: ${ pulse } 2s ease-in-out infinite;
	height: 20px;
	width: 125px;

	.rtl & {
		margin: 3px 40px 0 0;
	}

	::before {
		content: '';
		display: block;
		position: absolute;
		left: -40px;
		top: -3px;
		width: 27px;
		height: 27px;
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 100%;

		.rtl & {
			right: -40px;
			left: auto;
		}
	}
`;

const LoadingRow = styled.div`
	display: flex;
	justify-content: space-between;
`;

const LoadingCopy = styled.p< LoadingContainerProps >`
	font-size: 14px;
	height: ${ ( props ) => props.height ?? '16px' };
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 8px 0 0 40px;
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
	width: ${ ( props ) => props.width ?? 'inherit' };
	box-sizing: border-box;

	.rtl & {
		margin: 8px 40px 0 0;
	}
`;

export default function LoadingContent() {
	const { __ } = useI18n();

	return (
		<LoadingContentWrapper>
			<LoadingContentInnerWrapper>
				<LoadingCard>
					<LoadingTitle>{ __( 'Loading checkout' ) }</LoadingTitle>
					<LoadingCopy width="225px" />
				</LoadingCard>
				<LoadingCard>
					<LoadingRow>
						<LoadingCopy width="150px" />
						<LoadingCopy width="45px" />
					</LoadingRow>
					<LoadingCopy height="35px" width="225px" />
					<LoadingCopy width="100px" />
				</LoadingCard>
				<LoadingCard>
					<LoadingRow>
						<LoadingCopy width="150px" />
						<LoadingCopy width="45px" />
					</LoadingRow>
					<LoadingCopy height="35px" width="225px" />
					<LoadingCopy width="100px" />
				</LoadingCard>
				<LoadingCard>
					<LoadingTitle />
					<LoadingCopy width="300px" />
				</LoadingCard>
				<LoadingCard>
					<LoadingTitle />
					<LoadingCopy width="300px" />
				</LoadingCard>
			</LoadingContentInnerWrapper>
		</LoadingContentWrapper>
	);
}
