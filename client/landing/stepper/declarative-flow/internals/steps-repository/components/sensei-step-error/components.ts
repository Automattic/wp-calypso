import { ErrorIcon as UnstyledErrorIcon } from '@automattic/src/src/components/shared-icons';
import styled from '@emotion/styled';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex: 1;
`;

export const ErrorIcon = styled( UnstyledErrorIcon )`
	width: 40px;
	height: 40px;
	path {
		fill: var( --studio-orange-40 );
	}
`;

export const Title = styled.h1`
	font-family: Recoleta, sans-serif;
	font-size: 32px;
	line-height: 40px;
	margin: 40px;
`;

export const TryAgain = styled.button`
	font-size: 16px;
	line-height: 20px;
	cursor: pointer;
	color: #117ac9;
`;

export const ContactSupport = styled.p`
	font-size: 12px;
	line-height: 20px;
	margin: 40px 0;
`;
