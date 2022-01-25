import styled from '@emotion/styled';
import FormLabel from 'calypso/components/forms/form-label';

export const HorizontalGrid = styled.div`
	display: flex;
	justify-content: space-between;
	width: 627px;
`;

export const Label = styled( FormLabel )`
	font-style: normal;
	font-weight: 600;
	font-size: 13px;
	line-height: 20px;
	text-align: center;
	color: #2c3338;
	text-decoration-line: underline;
	letter-spacing: -0.16px;
	text-overflow: ellipsis;
	max-width: 195px;
	white-space: nowrap;
	overflow: hidden;
`;
export const SubLabel = styled( Label )`
	font-weight: 400;
	text-decoration-line: none;
	color: ${ ( props ) => ( props.color ? props.color : 'inherited' ) };
`;

export const Paragraph = styled.p`
	font-size: 13px;
`;
