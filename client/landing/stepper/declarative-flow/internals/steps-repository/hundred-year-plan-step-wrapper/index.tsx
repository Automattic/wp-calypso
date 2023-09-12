import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, type ReactElement, PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FoldableCard from 'calypso/components/foldable-card';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import HundredYearPlanLogo from './hundred-year-plan-logo';
import InfoModal from './info-modal';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

type Props = {
	stepName: string;
	flowName: string;
	stepContent: ReactElement;
	formattedHeader?: ReactElement;
};

const FlexWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
`;

const Container = styled.div< { isMobile: boolean } >`
	display: flex;
	flex-direction: ${ ( props ) => ( props.isMobile ? 'column' : 'row' ) };
	width: 100%;
	min-height: 100vh;
`;

const InfoColumnContainer = styled.div< { isMobile: boolean } >`
	min-width: 456px;
	display: flex;
	flex-direction: ${ ( props ) => ( props.isMobile ? 'row' : 'column' ) };
	align-items: ${ ( props ) => ( props.isMobile ? 'flex-start' : 'center' ) };
	justify-content: ${ ( props ) => ( props.isMobile ? 'flex-start' : 'center' ) };
	padding: 0 0 32px 0;
	padding-inline-start: ${ ( props ) => ( props.isMobile ? '16px' : '0' ) };
	gap: 24px;
	position: ${ ( props ) => ( props.isMobile ? 'initial' : 'fixed' ) };
	height: ${ ( props ) => ( props.isMobile ? 'initial' : '100vh' ) };
`;

const InfoColumnPlaceholder = styled.div< { isMobile: boolean } >`
	min-width: 456px;
	height: 100%;
`;

const Info = styled.div< { isMobile: boolean } >`
	display: flex;
	flex-direction: column;
	align-items: ${ ( props ) => ( props.isMobile ? 'flex-start' : 'center' ) };
	justify-content: ${ ( props ) => ( props.isMobile ? 'flex-start' : 'center' ) };
`;

const Title = styled.div`
	color: var( --gray-gray-0, #f6f7f7 );
	font-feature-settings: 'clig' off, 'liga' off;
	/* Xl/Serif */
	font-family: Recoleta;
	font-size: 32px;
	font-style: normal;
	font-weight: 400;
	line-height: 40px; /* 125% */
	letter-spacing: -0.32px;

	margin-bottom: 8px;
	text-align: center;
`;
const Description = styled.div< { isMobile: boolean } >`
	color: var( --gray-gray-5, #dcdcde );
	text-align: ${ ( props ) => ( props.isMobile ? 'start' : 'center' ) };

	/* Base/Medium */
	font-family: 'SF Pro Text', sans-serif;
	font-size: 14px;
	font-style: normal;
	font-weight: 500;
	line-height: 20px; /* 142.857% */
	letter-spacing: -0.15px;
`;
const Price = styled.div`
	color: var( --gray-gray-0, #f6f7f7 );
	font-feature-settings: 'clig' off, 'liga' off;

	/* Lg/Medium */
	font-family: 'SF Pro Display', sans-serif;
	font-size: 20px;
	font-style: normal;
	font-weight: 500;
	line-height: 26px; /* 130% */
	letter-spacing: 0.38px;
	text-align: center;

	margin-top: 24px;
`;

const LearnMore = styled( Button )`
	&.components-button.is-link {
		color: var( --gray-gray-0, #f6f7f7 );
		text-align: right;
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		line-height: 20px; /* 142.857% */
		letter-spacing: -0.16px;
		margin-top: 16px;

		.gridicon {
			margin-inline-start: 4px;
		}
	}
`;

const StyledFoldableCard = styled( FoldableCard )`
	background: #000;
	color: #fff;
	width: 100%;
	&.foldable-card.card.is-expanded {
		margin: 0;
	}
	&.foldable-card.is-expanded .foldable-card__content {
		border: none;
	}

	&.card.foldable-card {
		.foldable-card__header {
			.foldable-card__main {
				/* max-width: none; */
				justify-content: flex-end;
				/* margin-inline-end: 4px; */
			}
			.gridicons-chevron-down {
				fill: #fff;
			}
		}
	}
`;

function InfoColumnWrapper( { isMobile, children }: PropsWithChildren< { isMobile: boolean } > ) {
	const planTitle = getPlan( PLAN_100_YEARS )?.getTitle();

	return isMobile ? (
		<StyledFoldableCard smooth hideSummary={ true } header={ planTitle }>
			{ children }
		</StyledFoldableCard>
	) : (
		<>{ children }</>
	);
}

function InfoColumn( { isMobile, openModal }: { isMobile: boolean; openModal: () => void } ) {
	const translate = useTranslate();
	const displayCost = useSelector( ( state: IAppState ) =>
		getProductDisplayCost( state, PLAN_100_YEARS )
	);

	const planTitle = getPlan( PLAN_100_YEARS )?.getTitle();

	return (
		<>
			<InfoColumnPlaceholder isMobile={ isMobile } />

			<InfoColumnContainer
				className="hundred-year-plan-step-wrapper__info-column-container"
				isMobile={ isMobile }
			>
				<HundredYearPlanLogo />
				<Info isMobile={ isMobile }>
					<Title>{ planTitle }</Title>
					<Description isMobile={ isMobile }>
						{ translate(
							'Your stories, achievements, and memories{{br}}{{/br}}preserved for generations to come.',
							{
								components: {
									br: <br />,
								},
							}
						) }
						<br />
						{ translate( 'One payment. One hundred years of legacy.' ) }
					</Description>
					<LearnMore variant="link" onClick={ openModal }>
						<>
							{ translate( 'Learn More' ) }
							<Gridicon icon="info-outline" size={ 16 } />
						</>
					</LearnMore>
					<Price>{ displayCost }</Price>
				</Info>
			</InfoColumnContainer>
		</>
	);
}

function HundredYearPlanStepWrapper( props: Props ) {
	const { stepContent, stepName, flowName, formattedHeader } = props;

	const isMobile = useBreakpoint( '<960px' );
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	return (
		<StepContainer
			stepName={ stepName }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ flowName }
			hideFormattedHeader={ true }
			shouldStickyNavButtons={ false }
			stepContent={
				<Container isMobile={ isMobile }>
					{ isOpen && <InfoModal onClose={ closeModal } /> }
					<QueryProductsList persist />
					<InfoColumnWrapper isMobile={ isMobile }>
						<InfoColumn isMobile={ isMobile } openModal={ openModal } />
					</InfoColumnWrapper>
					<FlexWrapper>
						<div className="step-container__header">{ formattedHeader }</div>
						{ stepContent }
					</FlexWrapper>
				</Container>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

export default HundredYearPlanStepWrapper;
