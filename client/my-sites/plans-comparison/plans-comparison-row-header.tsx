import styled from '@emotion/styled';
import InfoPopover from 'calypso/components/info-popover';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	title?: TranslateResult;
	subtitle?: TranslateResult;
	description?: TranslateResult;
	scope?: 'row' | 'col';
}

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	gap: 5px;

	.info-popover .gridicon {
		color: var( --studio-gray-30 );
	}
`;

const TitleContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const Title = styled.div`
	font-weight: 600;
`;

const Subtitle = styled.div`
	color: var( --studio-gray-30 );
	font-size: 0.75rem;
	font-weight: 300;
`;

export const PlansComparisonRowHeader: React.FunctionComponent< Props > = ( {
	title,
	subtitle,
	description,
	scope,
} ) => {
	return (
		<th scope={ scope }>
			<Wrapper>
				<InfoPopover position="top" iconSize={ 16 } showOnHover={ true }>
					{ description }
				</InfoPopover>
				<TitleContainer>
					{ title && <Title>{ title }</Title> }
					{ subtitle && <Subtitle>{ subtitle }</Subtitle> }
				</TitleContainer>
			</Wrapper>
		</th>
	);
};
