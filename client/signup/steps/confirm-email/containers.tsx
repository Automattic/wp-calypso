import styled from '@emotion/styled';

export const MessageContainer = styled.div`
	text-align: center;
	max-width: 500px;
	margin: 0 auto 3em;
	line-height: 1.8;
`;

export const MessageText = styled.div`
	margin-bottom: 3em;
`;

export const ActionContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 3em;
`;

export const ActionText = styled.div`
	color: var( --studio-gray-90 );
`;

export const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	text-decoration: underline;
`;
