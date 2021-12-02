import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { ReactElement } from 'react';

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	min-height: 500px;
	column-gap: 2em;
	row-gap: 2em;

	@media ( max-width: 660px ) {
		grid-template-columns: 1fr;
	}
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
	buttonText: TranslateResult;
	buttonDisabled: boolean;
	buttonAction: () => void;
	notice: ReactElement | null;
	ctaRef?: React.RefObject< HTMLButtonElement >;
}

const CtaSection: React.FunctionComponent< Props > = ( props ) => {
	const {
		children,
		title,
		headline,
		buttonText,
		buttonDisabled = false,
		buttonAction,
		notice = null,
		ctaRef,
	} = props;
	return (
		<Container>
			<CtaContainer>
				<Headline>{ title }</Headline>
				<Title>{ headline }</Title>
				{ notice }
				<Button primary onClick={ buttonAction } ref={ ctaRef } disabled={ buttonDisabled }>
					{ buttonText }
				</Button>
			</CtaContainer>
			<ContentContainer>{ children }</ContentContainer>
		</Container>
	);
};

export default CtaSection;
