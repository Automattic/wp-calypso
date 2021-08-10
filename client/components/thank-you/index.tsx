/**
 * External dependencies
 */
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
/**
 * Internal dependencies
 */
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import {
	ThankYouNextStepProps,
	ThankYouProps,
	ThankYouSectionProps,
	ThankYouThemeProps,
} from './types';

/**
 * style dependencies
 */
import './style.scss';

const ThankYouContainer = styled.div< ThankYouThemeProps >`
	background-color: #fff;
	-ms-overflow-style: none;
	/* Negative value to counteract default content padding */
	margin-top: calc( -79px + var( --masterbar-height ) );

	@media screen and ( max-width: 782px ) {
		margin-top: 0;
	}
`;

const ThankYouHeader = styled.div`
	width: 100%;
	height: 240px;
	display: flex;
	justify-content: center;
`;

const ThankYouHeaderTitle = styled.h1`
	font-size: ${ ( { subtitle = false } ) => ( subtitle ? '1.5em' : '2em' ) };
	margin-bottom: 8px;
`;

const ThankYouSectionContainer = styled.div`
	margin-bottom: 35px;
`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 460px;
		padding: 0 35px;
	}
	div {
		min-width: 144px;
	}
`;

const ThankYouNextSteps = styled.div< ThankYouThemeProps >`
	h3 {
		font-weight: ${ ( { theme } ) => theme?.weights.bold };
	}

	p {
		color: var( --studio-gray-50 );
		padding-right: 20px;
	}
	> div {
		display: flex;
	}
`;

const ThankYouNextStep = ( props: ThankYouNextStepProps ) => {
	const { stepCta, stepDescription, stepKey, stepTitle } = props;

	return (
		<React.Fragment key={ stepKey }>
			<h3>{ stepTitle }</h3>
			<div>
				<p>{ stepDescription }</p>
				<div>{ stepCta }</div>
			</div>
		</React.Fragment>
	);
};

const ThankYouSection = ( props: ThankYouSectionProps ) => {
	const { nextSteps, sectionTitle } = props;

	const nextStepComponents = nextSteps.map( ( nextStepProps, index ) => (
		<ThankYouNextStep key={ index } { ...nextStepProps } />
	) );

	return (
		<ThankYouSectionContainer>
			<ThankYouHeaderTitle subtitle className="thank-you__body-header wp-brand-font">
				{ sectionTitle }
			</ThankYouHeaderTitle>

			<ThankYouNextSteps>{ nextStepComponents }</ThankYouNextSteps>
		</ThankYouSectionContainer>
	);
};

export const ThankYou = ( props: ThankYouProps ): JSX.Element => {
	const translate = useTranslate();

	const {
		headerClassName,
		containerClassName,
		sections,
		showSupportSection = true,
		thankYouTitle,
		thankYouImage,
	} = props;

	const thankYouSections = sections.map( ( sectionProps, index ) => (
		<ThankYouSection key={ index } { ...sectionProps } />
	) );

	return (
		<ThankYouContainer className={ classNames( 'thank-you__container', containerClassName ) }>
			<ThankYouHeader className={ classNames( 'thank-you__container-header', headerClassName ) }>
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				<img { ...thankYouImage } />
			</ThankYouHeader>
			<ThankYouBody>
				<div>
					<ThankYouSectionContainer>
						<ThankYouHeaderTitle className="thank-you__body-header wp-brand-font">
							{ thankYouTitle }
						</ThankYouHeaderTitle>
					</ThankYouSectionContainer>

					{ thankYouSections }

					{ showSupportSection && (
						<ThankYouSectionContainer>
							<ThankYouHeaderTitle subtitle className="thank-you__body-header wp-brand-font">
								{ translate( 'How can we help?' ) }
							</ThankYouHeaderTitle>
							<p>
								{ translate(
									'Our Happiness Engineers are here if you need help, or if you have any questions.'
								) }
							</p>
							<VerticalNav>
								<VerticalNavItem path={ CALYPSO_CONTACT }>
									{ translate( 'Ask a question' ) }
								</VerticalNavItem>
								<VerticalNavItem path={ SUPPORT_ROOT }>
									{ translate( 'Support documentation' ) }
								</VerticalNavItem>
							</VerticalNav>
						</ThankYouSectionContainer>
					) }
				</div>
			</ThankYouBody>
		</ThankYouContainer>
	);
};
