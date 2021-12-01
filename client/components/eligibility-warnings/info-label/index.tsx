import styled from '@emotion/styled';
import { ReactElement, ReactNode } from 'react';

const Banner = styled.div`
	color: var( --studio-gray-90 );
	background-color: var( --studio-gray-0 );
	display: flex;
	align-items: center;
	height: 40px;
	box-sizing: border-box;
	padding: 0 16px;
`;

const Content = styled.div`
	flex-grow: 2;
`;

const Label = styled.div`
	font-size: 14px;
	background-color: ${ ( props ) => ( props.type === 'info' ? '#b8e6bf' : '#eaeaea' ) };
	height: 20px;
	line-height: 20px;
	padding: 0 10px;
	border-radius: 4px;
	margin-left: 10px;
`;

interface InfoLabelProps {
	children: ReactNode;
	label?: string;
	type?: string;
}

export default function InfoLabel( {
	children,
	label,
	type = 'info',
}: InfoLabelProps ): ReactElement {
	return (
		<Banner>
			<Content>{ children }</Content>
			{ label && <Label type={ type }>{ label }</Label> }
		</Banner>
	);
}
