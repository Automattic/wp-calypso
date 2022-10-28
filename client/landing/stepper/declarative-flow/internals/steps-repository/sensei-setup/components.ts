import styled from '@emotion/styled';

export const Title = styled.h1`
	margin-top: 16px;
	font-size: 36px;
	line-height: 40px;
	font-family: 'Recoleta';
`;

export const Label = styled.label`
	margin-top: 40px;
	font-size: 14px;
	line-height: 20px;
`;

export const Input = styled.input`
	margin-top: 10px;
	padding: 10px 16px;
	font-size: 14px;
	line-height: 20px;

	&:placehoder {
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

	&:disabled {
		background-color: #aaa;
	}
`;
