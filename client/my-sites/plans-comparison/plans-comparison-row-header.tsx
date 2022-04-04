import styled from '@emotion/styled';
import InfoPopover from 'calypso/components/info-popover';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	title: TranslateResult;
	subtitle?: TranslateResult;
	description?: TranslateResult;
	scope?: 'row' | 'col';
}

const Details = styled.div`
	html[dir='ltr'] & {
		margin-left: 6px;
	}
	html[dir='rtl'] & {
		margin-right: 6px;
	}
`;
const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	min-height: 100%;
	align-items: center;

	.gridicon {
		display: block;
		color: var( --studio-gray-20 );
	}
`;

const Title = styled.div`
	display: flex;
	flex-direction: row;
	gap: 5px;
	font-weight: 500;
	align-items: center;
`;

const Subtitle = styled.div`
	color: var( --studio-gray-50 );
	font-size: 0.75rem;
	font-weight: 300;
	line-height: 1.4;
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
				<InfoPopover position="top" iconSize={ 18 } showOnHover={ true }>
					{ description }
				</InfoPopover>
				<Details>
					<Title>{ title }</Title>
					{ subtitle && <Subtitle>{ subtitle }</Subtitle> }
				</Details>
			</Wrapper>
		</th>
	);
};
