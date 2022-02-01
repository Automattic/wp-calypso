import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { ReactElement } from 'react';

const Container = styled.div`
	min-height: 500px;
`;

const CtaContainer = styled.div`
	justify-self: start;

	@media ( max-width: 660px ) {
		margin-bottom: 4em;
		text-align: center;
	}
`;

const ContentContainer = styled.div`
	justify-self: end;
`;

const Headline = styled.h3`
	font-size: 16px;
	padding-bottom: 10px;
`;

const Title = styled.h4`
	font-family: Recoleta;
	color: var( --studio-gray-90 );
	font-size: 2.81rem;
	line-height: 1.19;
	padding-bottom: 1em;
`;

interface Props {
	title?: TranslateResult;
	headline?: TranslateResult;
	notice?: ReactElement | null;
	cta?: ReactElement | null;
	byline?: ReactElement | null;
	children?: ReactElement | null;
}

const CtaSection: React.FunctionComponent< Props > = ( {
	title = '',
	headline = '',
	notice = null,
	cta = null,
	children = null,
	byline = null,
} ) => {
	return (
		<Container>
			<CtaContainer>
				<Title>{ title }</Title>
				<Headline>{ headline }</Headline>
				{ notice }
				{ cta }
				{ byline }
			</CtaContainer>
			<ContentContainer>{ children }</ContentContainer>
		</Container>
	);
};
export default CtaSection;
