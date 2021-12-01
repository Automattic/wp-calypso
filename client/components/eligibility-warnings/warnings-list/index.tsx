import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import { ReactElement } from 'react';
import Card from '../card';

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

const WarningTitle = styled.span`
	font-weight: bold;
`;

type WarningListProps = {
	warnings: Array< {
		name: string;
		description: string;
	} >;
};

const WarningList = ( { warnings }: WarningListProps ): ReactElement => (
	<Card icon="notice-outline" title={ __( 'Things you should be aware of' ) }>
		<WarningsList>
			{ warnings?.map( ( { name, description }, index ) => (
				<WarningListItem key={ index }>
					<WarningTitle>{ name }</WarningTitle>
					:&nbsp;
					<WarningDescription>{ description }</WarningDescription>
				</WarningListItem>
			) ) }
		</WarningsList>
	</Card>
);

export default WarningList;
