import styled from '@emotion/styled';
import InfoPopover from 'calypso/components/info-popover';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	title: TranslateResult;
	subtitle?: TranslateResult;
	description?: TranslateResult;
	scope?: 'row' | 'col';
}

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 21px;
	min-height: 100%;
`;

const Title = styled.div`
	display: flex;
	flex-direction: row;
	gap: 5px;
	font-weight: 600;
	margin-left: -21px;

	.gridicon {
		display: block;
		color: var( --studio-gray-30 );
	}
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
		<th scope={ scope } className={ `is-first` }>
			<Wrapper>
				<Title>
					<InfoPopover position="top" iconSize={ 16 } showOnHover={ true }>
						{ description }
					</InfoPopover>
					{ title }
				</Title>
				{ subtitle && <Subtitle>{ subtitle }</Subtitle> }
			</Wrapper>
		</th>
	);
};
