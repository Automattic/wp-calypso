import styled from '@emotion/styled';
import { ReactElement } from 'react';

const WarningsList = styled.ul`
	margin: 10px 0 10px 20px;
`;

const WarningListItem = styled.li`
	font-size: 0.875rem;
	letter-spacing: -0.16px;
	color: var( --studio-gray-60 );
	line-height: 1.25rem;
	margin-bottom: 0.75rem;
`;

const WarningDescription = styled.span``;

const WarningList = ( { warnings } ): ReactElement => (
	<WarningsList>
		{ warnings?.map( ( warning: string, index: number ) => (
			<WarningListItem key={ index }>
				<WarningDescription>{ warning }</WarningDescription>
			</WarningListItem>
		) ) }
	</WarningsList>
);

export default WarningList;
