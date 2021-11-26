import { Gridicon } from '@automattic/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { map } from 'lodash';
import styled from '@emotion/styled';
import ActionPanelLink from 'calypso/components/action-panel/link';

const WarningsList = styled.ul`
	margin: 10px 0 10px 20px;
`;

const WarningListItem = styled.li`
	font-size: 0.875rem;
	letter-spacing: -0.16px;
	color: var( --studio-gray-60 );
	line-height: 2rem;
`;

const WarningTitle = styled.span`
	font-weight: bold;
`;

const WarningDescription = styled.span``;

export const WarningList = ( { warnings } ) => (
	<WarningsList>
		{ warnings?.map( ( { name, description }, index ) => (
			<WarningListItem key={ index }>
				<WarningTitle>{ name }</WarningTitle>
				:&nbsp;
				<WarningDescription>{ description }</WarningDescription>
			</WarningListItem>
		) ) }
	</WarningsList>
);

export default localize( WarningList );
