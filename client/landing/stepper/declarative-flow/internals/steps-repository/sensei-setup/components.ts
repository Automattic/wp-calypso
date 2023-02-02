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

	&:placeholder {
		color: #909398;
	}
`;

export const Button = styled.button`
	margin-top: 40px;
	padding: 10px 80px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
	background-color: #0675c4;
	border-radius: 4px;
	color: #fff;
	cursor: pointer;

	&:disabled {
		background-color: #aaa;
		cursor: not-allowed;
	}
`;
