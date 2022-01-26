import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate, useRtl } from 'i18n-calypso';
import { AccordionSectionProps } from './types';

interface AccordionFormSectionProps< T > extends AccordionSectionProps< T > {
	isExpanded: boolean;
	isTouched: boolean;
	onOpen: () => void;
	onNext: ( arg0: object ) => void;
}

interface SectionHeaderProps {
	isExpanded: boolean;
	isTouched: boolean;
	onClick: () => void;
}

const Section = styled.div`
	border-bottom: 1px solid var( --studio-gray-5 );
	padding: 20px;
`;

const SectionHeader = styled.div< SectionHeaderProps >`
	align-items: center;
	display: flex;
	cursor: pointer;
	font-weight: 500;
	font-size: ${ ( props ) => ( props.isExpanded ? '20px' : '16px' ) };
	line-height: 24px;
	gap: 10px;
	color: ${ ( props ) =>
		props.isTouched ? 'var( --studio-gray-100 )' : 'var( --studio-gray-40 )' };
`;

const SectionContent = styled.div`
	display: flex;
	flex-direction: column;
	padding: 16px 0 36px 0;
	@media ( min-width: 600px ) {
		padding-right: 96px;
	}
`;

const ButtonsContainer = styled.div`
	margin-top: 24px;
	align-items: center;
	display: flex;
	gap: 24px;
`;

const SkipLink = styled.a`
	cursor: pointer;
	font-size: 14px;
	line-height: 20px;
	color: var( --studio-gray-60 );
	text-decoration: none;
`;

const RequiredLabel = styled.span`
	background: var( --studio-gray-0 );
	border-radius: 4px;
	color: var( --studio-gray-50 );
	font-weight: 500;
	font-size: 11px;
	line-height: 13px;
	letter-spacing: 0.38px;
	color: var( --studio-gray-50 );
	padding: 2px 8px;
	text-transform: uppercase;
`;

const SummaryLabel = styled( RequiredLabel )`
	margin-left: auto;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: right;
`;

const NextButton = styled( Button )`
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 5px;
	padding: 10px 64px;
	.gridicon {
		margin-left: 10px;
	}
`;

export default function AccordionFormSection< T >( props: AccordionFormSectionProps< T > ) {
	const translate = useTranslate();
	const isRTL = useRtl();

	return (
		<Section>
			<SectionHeader
				isExpanded={ props.isExpanded }
				isTouched={ props.isTouched }
				onClick={ props.onOpen }
			>
				<span>{ props.title }</span>
				{ props.isExpanded && ! props.showSkip && (
					<RequiredLabel>{ translate( 'Required' ) }</RequiredLabel>
				) }
				{ ! props.isExpanded && props.summary && <SummaryLabel>{ props.summary }</SummaryLabel> }
			</SectionHeader>
			{ props.isExpanded && (
				<SectionContent>
					{ props.component ? props.component : props.children }
					<ButtonsContainer>
						<NextButton onClick={ props.onNext }>
							{ translate( 'Next' ) }
							<Gridicon icon={ isRTL ? 'arrow-left' : 'arrow-right' } />
						</NextButton>
						{ props.showSkip && (
							<SkipLink onClick={ props.onNext }>{ translate( 'Skip' ) }</SkipLink>
						) }
					</ButtonsContainer>
				</SectionContent>
			) }
		</Section>
	);
}
