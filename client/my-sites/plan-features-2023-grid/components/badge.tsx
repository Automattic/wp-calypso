import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

const BadgeContainer = styled.div`
	text-align: center;
	white-space: nowrap;
	font-size: 0.75rem;
	font-weight: 500;
	letter-spacing: 0.2px;
	line-height: 1.25rem;
	padding: 0 12px;
	border-radius: 4px;
	height: 21px;
	background-color: var( --studio-green-0 );
	display: inline-block;
	color: var( --studio-green-40 );
`;

const Badge: React.FunctionComponent< PropsWithChildren< { children: string } > > = ( {
	children,
} ) => {
	return <BadgeContainer className="badge">{ children }</BadgeContainer>;
};

export default Badge;
