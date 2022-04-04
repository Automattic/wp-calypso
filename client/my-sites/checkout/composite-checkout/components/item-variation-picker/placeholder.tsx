import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const LoadingContentWrapper = styled.div`
	width: 100%;
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 6px;
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

const LoadingOption = styled.div`
	font-size: 14px;
	height: 48px;
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
`;

export function ItemVariationPickerPlaceholder(): JSX.Element {
	return (
		<LoadingContentWrapper>
			<LoadingOption />
			<LoadingOption />
		</LoadingContentWrapper>
	);
}
