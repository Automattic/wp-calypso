import styled from '@emotion/styled';

export const Title = styled.h1`
	font-size: 36px;
	line-height: 40px;
	font-family: Recoleta, sans-serif;
	margin-bottom: 16px;
`;

export const Label = styled.label`
	margin-top: 24px;
	margin-bottom: 8px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
`;

export const Hint = styled.div`
	font-size: 13px;
`;

export const Input = styled.input`
	padding: 12px 16px;
	font-size: 14px;
	line-height: 20px;
	border: 1px solid #c3c4c7;
	border-radius: 4px;

	&:placeholder {
		color: #909398;
	}
`;
