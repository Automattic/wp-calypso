import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

const Container = styled.div`
	color: var( --studio-gray-90 );
	background-color: var( --studio-gray-0 );
	display: flex;
	align-items: center;
	box-sizing: border-box;
	padding: 10px;
`;

const ContentSection = styled.div`
	line-height: 1.25rem;
`;

const IconSection = styled.div`
	display: flex;
	justify-content: center;
	margin-right: 10px;
`;

const StyledIcon = styled( Gridicon )`
	fill: #e65054;
	margin-right: 0.5rem;
`;

function WarningCard( { message }: { message: ReactNode } ): JSX.Element {
	return (
		<Container>
			<IconSection>
				<StyledIcon icon="notice-outline" />{ ' ' }
			</IconSection>
			<ContentSection>{ message }</ContentSection>
		</Container>
	);
}

export default WarningCard;
