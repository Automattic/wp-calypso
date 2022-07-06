import styled from '@emotion/styled';
import { ReactNode } from 'react';

const Wrapper = styled.span`
	font-size: 12px;
	font-weight: 500;
	color: var( --studio-gray-80 );
	background-color: var( --studio-gray-5 );
	padding: 0px 10px;
	margin-left: 10px;
	border-radius: 4px;
	line-height: 20px;
`;

interface SitesBadgePrpos {
	children: ReactNode;
}

function SitesBadge( { children }: SitesBadgePrpos ) {
	return <Wrapper>{ children }</Wrapper>;
}

export default SitesBadge;
